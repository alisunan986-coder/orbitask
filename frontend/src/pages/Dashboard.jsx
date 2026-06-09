import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PomodoroTimer from '../components/PomodoroTimer'

function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [tags, setTags] = useState('')
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const name = localStorage.getItem('name')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    const res = await fetch('http://localhost:3000/tasks', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setTasks(data)
  }

 const handleAddTask = async () => {
  if (!title) return

  const res = await fetch('http://localhost:3000/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title,
      description,
      priority,
      tags: tags.split(',').map(t => t.trim()).filter(t => t !== '')
    })
  })

  const newTask = await res.json()
  setTasks([...tasks, newTask])
  setTitle('')
  setDescription('')
  setPriority('medium')
  setTags('')
}

  const handleDelete = async (id) => {
    await fetch(`http://localhost:3000/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    setTasks(tasks.filter(t => t.id !== id))
  }

  const handleStatus = async (task) => {
    const nextStatus = task.status === 'todo' ? 'inprogress' : task.status === 'inprogress' ? 'done' : 'todo'

    const res = await fetch(`http://localhost:3000/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ...task, status: nextStatus })
    })

    const updated = await res.json()
    setTasks(tasks.map(t => t.id === updated.id ? updated : t))
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('name')
    navigate('/login')
  }

  const priorityColor = {
    low: '#38a169',
    medium: '#d69e2e',
    high: '#e53e3e'
  }

  const statusLabel = {
    todo: 'To Do',
    inprogress: 'In Progress',
    done: 'Done'
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>🪐 Orbitask</h1>
        <div style={styles.headerRight}>
          <span style={styles.welcome}>Hello, {name}!</span>
                  <button style={styles.navBtn} onClick={() => navigate('/kanban')}>
          Kanban View
        </button>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Add Task Form */}
      <div style={styles.form}>
        <h2 style={styles.formTitle}>Add a new task</h2>
        <input
          style={styles.input}
          placeholder="Task title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
                  <input
            style={styles.input}
            placeholder="Tags (comma separated: Work, Personal, Urgent)"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
        <select
          style={styles.input}
          value={priority}
          onChange={e => setPriority(e.target.value)}
        >
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
        </select>
        <button style={styles.button} onClick={handleAddTask}>
          Add Task
        </button>
      </div>

      <div style={{ margin: '32px auto', maxWidth: '600px', padding: '0 16px' }}>
  <PomodoroTimer
    tasks={tasks}
    token={token}
    onTimeLogged={fetchTasks}
  />
</div>

        {/* Task List */}
        <div style={styles.taskList}></div>


      {/* Task List */}
      <div style={styles.taskList}>
        {tasks.length === 0 && (
          <p style={styles.empty}>No tasks yet — add one above! 🚀</p>
        )}
        {tasks.map(task => (
          <div key={task.id} style={styles.taskCard}>
            <div style={styles.taskTop}>
              <h3 style={styles.taskTitle}>{task.title}</h3>
              <span style={{ ...styles.priority, color: priorityColor[task.priority] }}>
                {task.priority}
              </span>
            </div>
            {task.description && (
              <p style={styles.taskDesc}>{task.description}</p>
            )}
            {task.tags && task.tags.length > 0 && (
  <div style={styles.tags}>
    {task.tags.map((tag, i) => (
      <span key={i} style={styles.tag}>{tag}</span>
    ))}
  </div>
)}
            <div style={styles.taskBottom}>
              <button style={styles.statusBtn} onClick={() => handleStatus(task)}>
                {statusLabel[task.status]}
              </button>
              <button style={styles.deleteBtn} onClick={() => handleDelete(task.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f4f0',
    fontFamily: 'sans-serif',
    paddingBottom: '40px'
  },
  header: {
    backgroundColor: '#fff',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
  },
  logo: {
    fontSize: '20px',
    margin: 0
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  welcome: {
    fontSize: '14px',
    color: '#666'
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  form: {
    backgroundColor: '#fff',
    margin: '32px auto',
    padding: '24px',
    borderRadius: '16px',
    maxWidth: '600px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
  },
  formTitle: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '16px',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '12px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    fontSize: '15px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#fff'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#5c4ff6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    cursor: 'pointer'
  },
  taskList: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '0 16px'
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: '40px'
  },
  taskCard: {
    backgroundColor: '#fff',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
  },
  taskTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  taskTitle: {
    fontSize: '16px',
    fontWeight: '500',
    margin: 0,
    color: '#333'
  },
  priority: {
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase'
  },
  taskDesc: {
    fontSize: '14px',
    color: '#666',
    margin: '8px 0 0'
  },
  taskBottom: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px'
  },
  statusBtn: {
    padding: '6px 12px',
    backgroundColor: '#eef0ff',
    color: '#5c4ff6',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  deleteBtn: {
    padding: '6px 12px',
    backgroundColor: '#fff5f5',
    color: '#e53e3e',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  navBtn: {
  padding: '8px 16px',
  backgroundColor: '#5c4ff6',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px'
}
}

export default Dashboard