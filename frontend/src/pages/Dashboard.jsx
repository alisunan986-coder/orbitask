import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PomodoroTimer from '../components/PomodoroTimer'
import { io } from 'socket.io-client'

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
    useEffect(() => {
  const socket = io('http://localhost:3000')

  socket.on('taskUpdated', () => {
    fetchTasks()
  })

  return () => socket.disconnect()
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
  // optimistic update — remove instantly
  const previousTasks = tasks
  setTasks(tasks.filter(t => t.id !== id))

  try {
    await fetch(`http://localhost:3000/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (err) {
    // rollback if failed
    setTasks(previousTasks)
    alert('Failed to delete task — please try again')
  }
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
        <button style={styles.navBtn} onClick={() => navigate('/analytics')}>
  Analytics
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
    backgroundColor: '#fef9ec',
    fontFamily: 'inherit'
  },
  header: {
    backgroundColor: '#ffffff',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #e8e0d0'
  },
  logo: {
    fontSize: '22px',
    margin: 0,
    fontWeight: '700',
    color: '#1a1a1a'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  welcome: {
    fontSize: '14px',
    color: '#888'
  },
  navBtn: {
    padding: '8px 16px',
    backgroundColor: '#f5a623',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1.5px solid #e8e0d0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#888'
  },
  form: {
    backgroundColor: '#ffffff',
    margin: '32px auto',
    padding: '28px',
    borderRadius: '20px',
    maxWidth: '600px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    border: '1px solid #e8e0d0'
  },
  formTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#1a1a1a'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    marginBottom: '12px',
    borderRadius: '10px',
    border: '1.5px solid #e8e0d0',
    fontSize: '15px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#fffdf7',
    color: '#1a1a1a'
  },
  button: {
    width: '100%',
    padding: '13px',
    backgroundColor: '#f5a623',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  taskList: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '0 16px'
  },
  empty: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: '48px',
    fontSize: '15px'
  },
  taskCard: {
    backgroundColor: '#ffffff',
    padding: '18px 20px',
    borderRadius: '14px',
    marginBottom: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    border: '1px solid #e8e0d0'
  },
  taskTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  taskTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
    color: '#1a1a1a'
  },
  priority: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    padding: '3px 10px',
    borderRadius: '20px',
    backgroundColor: '#fff3d0'
  },
  taskDesc: {
    fontSize: '14px',
    color: '#888',
    margin: '8px 0 0'
  },
  taskBottom: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px'
  },
  statusBtn: {
    padding: '6px 14px',
    backgroundColor: '#fff3d0',
    color: '#f5a623',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  deleteBtn: {
    padding: '6px 14px',
    backgroundColor: '#fff5f5',
    color: '#e53e3e',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  tags: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '8px'
  },
  tag: {
    backgroundColor: '#fff3d0',
    color: '#f5a623',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600'
  }
}

export default Dashboard