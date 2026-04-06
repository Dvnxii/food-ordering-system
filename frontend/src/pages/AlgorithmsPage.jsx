import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

const api = (url, options = {}) => {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}')
  return fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json', ...options.headers }
  }).then(r => r.json())
}

export default function AlgorithmsPage() {
  const { user } = useAuth()
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState({})
  const [minPrice, setMinPrice] = useState(20)
  const [maxPrice, setMaxPrice] = useState(80)
  const [staff, setStaff] = useState('Chef Ramesh, Chef Priya')

  const run = async (key, fn) => {
    setLoading(l => ({ ...l, [key]: true }))
    try {
      const data = await fn()
      setResults(r => ({ ...r, [key]: data }))
    } catch {
      toast.error('Run the backend first!')
    } finally {
      setLoading(l => ({ ...l, [key]: false }))
    }
  }

  const algorithms = [
    {
      key: 'binary',
      title: '🔍 Binary Search',
      subtitle: 'Search menu items by price range',
      complexity: 'O(log n)',
      color: '#5b9cf6',
      description: 'Sorts menu items by price first, then uses binary search to find left and right boundaries of the price range. Much faster than checking every item.',
      controls: (
        <div style={styles.controls}>
          <label style={styles.controlLabel}>Min Price (₹)
            <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)}
              style={styles.numInput} />
          </label>
          <label style={styles.controlLabel}>Max Price (₹)
            <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
              style={styles.numInput} />
          </label>
        </div>
      ),
      run: () => run('binary', () => api(`/api/algorithms/menu/search?minPrice=${minPrice}&maxPrice=${maxPrice}`)),
      renderResult: (data) => (
        <div>
          <p style={styles.stat}>Searched {data.totalItems} items → Found <strong style={{color:'#5b9cf6'}}>{data.foundItems}</strong> in range ₹{data.minPrice}–₹{data.maxPrice}</p>
          <div style={styles.itemGrid}>
            {data.results?.map((item, i) => (
              <div key={i} style={styles.itemChip}>
                <span>{item.name}</span>
                <span style={{color:'#f5a623', fontWeight:700}}>₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      key: 'dfs',
      title: '🌳 DFS & BFS',
      subtitle: 'Traverse menu category tree',
      complexity: 'O(V + E)',
      color: '#4caf7d',
      description: 'DFS uses a Stack — goes deep into one category before moving to the next. BFS uses a Queue — visits all categories level by level. Both traverse the menu tree structure.',
      run: () => run('dfs', () => api('/api/algorithms/menu/dfs')),
      renderResult: (data) => (
        <div style={{display:'flex', gap:16, flexWrap:'wrap'}}>
          <div style={styles.traversalBox}>
            <p style={{color:'#4caf7d', fontWeight:700, marginBottom:8}}>📚 DFS Order (Stack)</p>
            {data.dfsOrder?.map((item, i) => (
              <div key={i} style={{...styles.traversalItem, marginLeft: item.startsWith(' ') ? 16 : 0}}>
                <span style={{color:'#4caf7d', marginRight:6}}>{i + 1}.</span>{item}
              </div>
            ))}
          </div>
          <div style={styles.traversalBox}>
            <p style={{color:'#5b9cf6', fontWeight:700, marginBottom:8}}>🌊 BFS Order (Queue)</p>
            {data.bfsOrder?.map((item, i) => (
              <div key={i} style={styles.traversalItem}>
                <span style={{color:'#5b9cf6', marginRight:6}}>{i + 1}.</span>{item}
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      key: 'sort',
      title: '📊 Priority Sort',
      subtitle: 'Sort orders by urgency',
      complexity: 'O(n log n)',
      color: '#a78bfa',
      description: 'Uses Java\'s merge sort (TimSort) with a custom comparator. Orders are ranked: PLACED > CONFIRMED > PREPARING > READY. Within same status, older orders come first.',
      run: () => run('sort', () => api('/api/algorithms/orders/sorted')),
      renderResult: (data) => (
        <div>
          <p style={styles.stat}>Sorted <strong style={{color:'#a78bfa'}}>{data.totalOrders}</strong> active orders by priority</p>
          {data.sortedOrders?.map((order, i) => (
            <div key={i} style={styles.orderRow}>
              <span style={styles.rank}>#{i + 1}</span>
              <span style={styles.orderId}>Order #{order.id}</span>
              <span className={`badge badge-${order.status?.toLowerCase()}`}>{order.status}</span>
              <span style={{color:'var(--text2)', fontSize:13}}>{order.student}</span>
              <span style={{color:'#f5a623', marginLeft:'auto'}}>₹{order.total}</span>
            </div>
          ))}
          {(!data.sortedOrders || data.sortedOrders.length === 0) && (
            <p style={{color:'var(--text3)'}}>No active orders. Place some orders first!</p>
          )}
        </div>
      )
    },
    {
      key: 'greedy',
      title: '⚡ Greedy Assignment',
      subtitle: 'Assign orders to staff optimally',
      complexity: 'O(n log n)',
      color: '#f5a623',
      description: 'Shortest Job First (SJF) greedy strategy. Orders with shortest prep time are assigned first. Always picks the staff member who will be free soonest — minimizes total waiting time.',
      controls: (
        <div style={styles.controls}>
          <label style={styles.controlLabel}>Staff Members (comma separated)
            <input value={staff} onChange={e => setStaff(e.target.value)} style={{...styles.numInput, width:'100%'}} />
          </label>
        </div>
      ),
      run: () => run('greedy', () => api('/api/algorithms/orders/assign', {
        method: 'POST',
        body: JSON.stringify(staff.split(',').map(s => s.trim()))
      })),
      renderResult: (data) => (
        <div>
          <p style={styles.stat}>
            <strong style={{color:'#f5a623'}}>{data.staffCount}</strong> staff members,
            <strong style={{color:'#f5a623'}}> {data.ordersAssigned}</strong> orders assigned
          </p>
          {data.assignments?.map((a, i) => (
            <div key={i} style={styles.assignRow}>
              <span style={{color:'#f5a623', fontWeight:700}}>Order #{a.orderId}</span>
              <span style={{color:'var(--text2)'}}>→ {a.assignedTo}</span>
              <span style={{color:'var(--text3)', fontSize:12}}>
                {a.prepTimeMinutes}min | t={a.startsAtMinute}→{a.endsAtMinute}min
              </span>
            </div>
          ))}
          {(!data.assignments || data.assignments.length === 0) && (
            <p style={{color:'var(--text3)'}}>No PLACED orders to assign. Place some orders first!</p>
          )}
        </div>
      )
    }
  ]

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.heading}>Algorithm Visualizer</h2>
          <p style={styles.sub}>Live demonstration of DSA algorithms in the food ordering system</p>
        </div>

        <div style={styles.grid}>
          {algorithms.map(algo => (
            <div key={algo.key} style={{...styles.card, borderColor: algo.color + '40'}}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={{...styles.cardTitle, color: algo.color}}>{algo.title}</h3>
                  <p style={styles.cardSub}>{algo.subtitle}</p>
                </div>
                <span style={{...styles.complexityBadge, background: algo.color + '20', color: algo.color}}>
                  {algo.complexity}
                </span>
              </div>

              <p style={styles.description}>{algo.description}</p>

              {algo.controls && algo.controls}

              <button style={{...styles.runBtn, background: algo.color}}
                onClick={algo.run} disabled={loading[algo.key]}>
                {loading[algo.key]
                  ? <><span className="spinner" style={{borderTopColor:'#000', width:14, height:14}} /> Running...</>
                  : '▶ Run Algorithm'}
              </button>

              {results[algo.key] && (
                <div style={styles.result}>
                  <p style={styles.resultLabel}>Result:</p>
                  {algo.renderResult(results[algo.key])}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg)' },
  container: { maxWidth: 1100, margin: '0 auto', padding: '40px 24px 64px' },
  header: { marginBottom: 36 },
  heading: { fontSize: 32, fontFamily: 'Syne', fontWeight: 800 },
  sub: { color: 'var(--text2)', marginTop: 6 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 24 },
  card: { background: 'var(--card)', borderRadius: 16, padding: 24, border: '1px solid', display: 'flex', flexDirection: 'column', gap: 16 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 20, fontFamily: 'Syne', fontWeight: 800, margin: 0 },
  cardSub: { color: 'var(--text2)', fontSize: 13, marginTop: 4 },
  complexityBadge: { padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' },
  description: { color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, margin: 0 },
  controls: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  controlLabel: { fontSize: 13, color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: 6 },
  numInput: { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 15, width: 100 },
  runBtn: { padding: '12px 20px', borderRadius: 10, border: 'none', color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' },
  result: { background: 'var(--bg3)', borderRadius: 10, padding: 16, border: '1px solid var(--border)' },
  resultLabel: { fontSize: 12, color: 'var(--text3)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  stat: { fontSize: 14, color: 'var(--text2)', marginBottom: 12 },
  itemGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  itemChip: { background: 'var(--bg)', borderRadius: 8, padding: '6px 12px', fontSize: 13, display: 'flex', gap: 8, border: '1px solid var(--border)' },
  traversalBox: { flex: 1, minWidth: 200 },
  traversalItem: { fontSize: 13, color: 'var(--text2)', padding: '3px 0', borderBottom: '1px solid var(--border)' },
  orderRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 },
  rank: { color: 'var(--text3)', fontWeight: 700, minWidth: 24 },
  orderId: { fontWeight: 600, fontFamily: 'Syne' },
  assignRow: { display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 },
}
