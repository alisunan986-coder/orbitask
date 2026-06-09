import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#5c4ff6', '#38a169', '#d69e2e', '#e53e3e']

function Analytics() {
  const [tasks, setTasks] = useState([])
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const name = localStorage.getItem('name')

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    const res = await fetch('http://localhost:3000/tasks', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setTasks(data)
  }

  // Tasks by status
  const statusData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'inprogress').length },
    { name: 'Under Review', value: tasks.filter(t => t.status === 'underreview').length },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length }
  ]

  // Tasks by priority
  const priorityData = [
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length }
  ]

  // Top 5 tasks by time spent
  const timeData = [...tasks]
    .sort((a, b) => b.timeSpent - a.timeSpent)
    .slice(0, 5)
    .map(t => ({
      name: t.title.length > 15 ? t.title.slice(0, 15) + '...' : t.title,
      minutes: t.timeSpent
    }))

  const totalFocusTime = tasks.reduce((acc, t) => acc + t.timeSpent, 0)
  const doneTasks = tasks.filter(t => t.status === 'done').length
  const totalTasks = tasks.length

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>🪐 Orbitask</h1>
        <div style={styles.headerRight}>
          <button style={styles.navBtn} onClick={() => navigate('/dashboard')}>List View</button>
          <button style={styles.navBtn} onClick={() => navigate('/kanban')}>Kanban</button>
          <button style={styles.logoutBtn} onClick={() => {
            localStorage.clear()
            navigate('/login')
          }}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <h2 style={styles.pageTitle}>📊 Analytics</h2>

        {/* Summary cards */}
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>Total Tasks</p>
            <p style={styles.summaryValue}>{totalTasks}</p>
          </div>
          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>Completed</p>
            <p style={{ ...styles.summaryValue, color: '#38a169' }}>{doneTasks}</p>
          </div>
          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>Completion Rate</p>
            <p style={{ ...styles.summaryValue, color: '#5c4ff6' }}>
              {totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0}%
            </p>
          </div>
          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>Total Focus Time</p>
            <p style={{ ...styles.summaryValue, color: '#d69e2e' }}>
              {Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m
            </p>
          </div>
        </div>

        {/* Charts */}
        <div style={styles.chartsGrid}>
          {/* Tasks by status */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Tasks by Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Tasks by priority */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Tasks by Priority</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#5c4ff6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Time spent per task */}
          <div style={{ ...styles.chartCard, gridColumn: 'span 2' }}>
            <h3 style={styles.chartTitle}>Top 5 Tasks by Focus Time (minutes)</h3>
            {timeData.length === 0 ? (
              <p style={styles.empty}>No time tracked yet — use the Pomodoro timer! 🍅</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={timeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis dataKey="name" type="category" fontSize={12} width={100} />
                  <Tooltip />
                  <Bar dataKey="minutes" fill="#38a169" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f4f0',
    fontFamily: 'sans-serif'
  },
  header: {
    backgroundColor: '#fff',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
  },
  logo: { fontSize: '20px', margin: 0 },
  headerRight: { display: 'flex', gap: '12px', alignItems: 'center' },
  navBtn: {
    padding: '8px 16px',
    backgroundColor: '#5c4ff6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  content: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '32px 24px'
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '600',
    marginBottom: '24px',
    color: '#333'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px'
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    textAlign: 'center'
  },
  summaryLabel: {
    fontSize: '13px',
    color: '#888',
    margin: '0 0 8px'
  },
  summaryValue: {
    fontSize: '28px',
    fontWeight: '700',
    margin: 0,
    color: '#333'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px'
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  chartTitle: {
    fontSize: '15px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#333'
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '40px 0'
  }
}

export default Analytics