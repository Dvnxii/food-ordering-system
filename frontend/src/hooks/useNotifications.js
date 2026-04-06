import { useEffect, useRef, useCallback } from 'react'

export function useNotifications(userId, onNotification, isStaff = false) {
  const lastOrderStatusRef = useRef({})
  const pollingRef = useRef(null)
  const clientRef = useRef(null)

  const getToken = () => {
    try {
      const auth = localStorage.getItem('auth')
      if (!auth) return null
      return JSON.parse(auth).token
    } catch {
      return null
    }
  }

  const startPolling = useCallback(() => {
    if (!userId) return

    const poll = async () => {
      const token = getToken()
      if (!token) return

      try {
        const url = isStaff ? '/api/orders/active' : '/api/orders/my'
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        })

        // If 403, token expired — stop silently
        if (res.status === 403 || res.status === 401) return
        if (!res.ok) return

        const orders = await res.json()

        orders.forEach(order => {
          const prev = lastOrderStatusRef.current[order.id]

          if (prev === undefined) {
            // First time seeing this order — just record it
            lastOrderStatusRef.current[order.id] = order.status
            return
          }

          if (prev !== order.status) {
            // Status changed! Fire notification
            const messages = {
              CONFIRMED: `✅ Order #${order.id} confirmed! Preparing your food.`,
              PREPARING: `👨‍🍳 Order #${order.id} is being prepared now.`,
              READY:     `🍽️ Your Order #${order.id} is READY for pickup!`,
              COLLECTED: `✔️ Order #${order.id} collected. Enjoy your meal!`,
            }
            const msg = messages[order.status]
            if (msg) {
              // Show toast in app
              onNotification({ type: order.status, message: msg, orderId: order.id })

              // Show browser popup notification
              if (Notification.permission === 'granted') {
                new Notification('🍽️ Campus Canteen', {
                  body: msg,
                  icon: '/favicon.ico'
                })
              }
            }
            lastOrderStatusRef.current[order.id] = order.status
          }
        })

        // For staff — refresh orders panel
        if (isStaff) {
          onNotification({ broadcast: true, type: 'REFRESH' })
        }

      } catch (e) {
        // ignore network errors
      }
    }

    // Run immediately then every 4 seconds
    poll()
    pollingRef.current = setInterval(poll, 4000)
  }, [userId, isStaff, onNotification])

  // WebSocket for real-time (best effort on top of polling)
  const startWebSocket = useCallback(() => {
    if (!userId) return
    Promise.all([
      import('@stomp/stompjs'),
      import('sockjs-client')
    ]).then(([{ Client }, SockJS]) => {
      const client = new Client({
        webSocketFactory: () => new SockJS.default('/ws'),
        reconnectDelay: 10000,
        onConnect: () => {
          console.log('WebSocket connected ✓')
          client.subscribe(`/user/${userId}/queue/notifications`, (msg) => {
            try {
              const data = JSON.parse(msg.body)
              onNotification(data)
              if (Notification.permission === 'granted') {
                new Notification('🍽️ Campus Canteen', { body: data.message })
              }
            } catch (e) {}
          })
          if (isStaff) {
            client.subscribe('/topic/orders', (msg) => {
              try { onNotification({ ...JSON.parse(msg.body), broadcast: true }) } catch (e) {}
            })
          }
        },
        onStompError: () => console.log('WebSocket unavailable, using polling'),
      })
      client.activate()
      clientRef.current = client
    }).catch(() => console.log('Using polling only'))
  }, [userId, isStaff, onNotification])

  useEffect(() => {
    if (!userId) return

    // Ask for browser notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(perm => {
        console.log('Notification permission:', perm)
      })
    }

    startPolling()
    startWebSocket()

    return () => {
      clearInterval(pollingRef.current)
      clientRef.current?.deactivate()
    }
  }, [userId, startPolling, startWebSocket])
}
