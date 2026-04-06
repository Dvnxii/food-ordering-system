import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const saved = localStorage.getItem('auth')
  if (saved) {
    const { token } = JSON.parse(saved)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  updateFcmToken: (token) => api.post('/auth/fcm-token', { token }),
}

// Menu
export const menuApi = {
  getAll: () => api.get('/menu'),
  getAllAdmin: () => api.get('/menu/all'),
  add: (item) => api.post('/menu', item),
  update: (id, item) => api.put(`/menu/${id}`, item),
  toggleAvailability: (id) => api.patch(`/menu/${id}/availability`),
  delete: (id) => api.delete(`/menu/${id}`),
}

// Orders
export const orderApi = {
  place: (order) => api.post('/orders', order),
  getMyOrders: () => api.get('/orders/my'),
  getById: (id) => api.get(`/orders/${id}`),
  getActive: () => api.get('/orders/active'),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  getStats: () => api.get('/orders/stats'),
}

export default api
