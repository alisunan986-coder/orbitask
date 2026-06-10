import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'



const COLUMNS = [
  { id: 'todo', label: 'To Do' },
  { id: 'inprogress', label: 'In Progress' },
  { id: 'underreview', label: 'Under Review' },
  { id: 'done', label: 'Done' }
]

const priorityColor = {
  low: '#38a169',
  medium: '#d69e2e',
  high: '#e53e3e'
}

function Kanban() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) { navigate('/login'); return }
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
  setLoading(false)
}
  const getTasksByStatus = (status) =>
    tasks.filter(t => t.status === status)

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result

    // dropped outside a column
    if (!destination) return

    // dropped in same place
    if (destination.droppableId === source.droppableId) return

    const taskId = Number(draggableId)
    const newStatus = destination.droppableId

    // optimistic update — update UI instantly
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    )

    // update in database
    try {
      await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
    } catch (err) {
      // rollback if failed
      fetchTasks()
    }
  }

  if (loading) return (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif', fontSize: '18px', color: '#666' }}>
    Loading... 🪐
  </div>
)

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>🪐 Orbitask</h1>
        <div style={styles.headerRight}>
          <button style={styles.navBtn} onClick={() => navigate('/dashboard')}>
            List View
          </button>
          <button style={styles.logoutBtn} onClick={() => {
            localStorage.clear()
            navigate('/login')
          }}>
            Logout
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={styles.board}>
          {COLUMNS.map(col => (
            <div key={col.id} style={styles.column}>
              <div style={styles.columnHeader}>
                <h3 style={styles.columnTitle}>{col.label}</h3>
                <span style={styles.count}>{getTasksByStatus(col.id).length}</span>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      ...styles.droppable,
                      backgroundColor: snapshot.isDraggingOver ? '#eef0ff' : '#f5f4f0'
                    }}
                  >
                    {getTasksByStatus(col.id).map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={String(task.id)}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...styles.card,
                              boxShadow: snapshot.isDragging
                                ? '0 8px 24px rgba(0,0,0,0.12)'
                                : '0 2px 8px rgba(0,0,0,0.06)',
                              ...provided.draggableProps.style
                            }}
                          >
                            <p style={styles.cardTitle}>{task.title}</p>
                            {task.description && (
                              <p style={styles.cardDesc}>{task.description}</p>
                            )}
                            <span style={{
                              ...styles.priority,
                              color: priorityColor[task.priority]
                            }}>
                              {task.priority}
                            </span>
                            {task.tags && task.tags.length > 0 && (
                        <div style={styles.tags}>
                          {task.tags.map((tag, i) => (
                            <span key={i} style={styles.tag}>{tag}</span>
                          ))}
                        </div>
                      )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
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
  logo: { fontSize: '22px', margin: 0, fontWeight: '700', color: '#1a1a1a' },
  headerRight: { display: 'flex', gap: '12px', alignItems: 'center' },
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
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    padding: '28px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  column: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    border: '1px solid #e8e0d0'
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px'
  },
  columnTitle: {
    fontSize: '14px',
    fontWeight: '700',
    margin: 0,
    color: '#1a1a1a'
  },
  count: {
    backgroundColor: '#fff3d0',
    color: '#f5a623',
    borderRadius: '12px',
    padding: '2px 10px',
    fontSize: '12px',
    fontWeight: '700'
  },
  droppable: {
    minHeight: '200px',
    borderRadius: '10px',
    padding: '8px',
    transition: 'background-color 0.2s'
  },
  card: {
    backgroundColor: '#fffdf7',
    border: '1.5px solid #e8e0d0',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '8px',
    cursor: 'grab'
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 4px',
    color: '#1a1a1a'
  },
  cardDesc: {
    fontSize: '12px',
    color: '#888',
    margin: '0 0 8px'
  },
  priority: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  tags: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
    marginTop: '6px'
  },
  tag: {
    backgroundColor: '#fff3d0',
    color: '#f5a623',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '10px',
    fontWeight: '600'
  }
}

export default Kanban