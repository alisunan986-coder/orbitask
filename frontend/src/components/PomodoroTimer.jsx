import { useState, useEffect, useRef } from 'react'

const MODES = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60
}

function PomodoroTimer({ tasks, token, onTimeLogged }) {
  const [mode, setMode] = useState('focus')
  const [timeLeft, setTimeLeft] = useState(MODES.focus)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef(null)

/// 1. Timer countdown
useEffect(() => {
  if (!isRunning) {
    clearInterval(intervalRef.current)
    return
  }
  intervalRef.current = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(intervalRef.current)
        setIsRunning(false)
        handleSessionComplete()
        return 0
      }
      return prev - 1
    })
  }, 1000)
  return () => clearInterval(intervalRef.current)
}, [isRunning])

// 2. Logging every minute
useEffect(() => {
  if (!isRunning || !selectedTaskId || mode !== 'focus') return
  const logInterval = setInterval(async () => {
    try {
      await fetch(`http://localhost:3000/tasks/${selectedTaskId}/time`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ minutes: 1 })
      })
      onTimeLogged()
    } catch (err) {
      console.error('Failed to log time', err)
    }
  }, 60000)
  return () => clearInterval(logInterval)
}, [isRunning, selectedTaskId, mode])

  const handleSessionComplete = async () => {
    if (mode === 'focus') {
      setSessions(prev => prev + 1)

      // log 25 minutes to selected task
      if (selectedTaskId) {
        try {
          await fetch(`http://localhost:3000/tasks/${selectedTaskId}/time`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ minutes: 25 })
          })
          onTimeLogged()
        } catch (err) {
          console.error('Failed to log time', err)
        }
      }
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setTimeLeft(MODES[newMode])
    setIsRunning(false)
    clearInterval(intervalRef.current)
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const progress = ((MODES[mode] - timeLeft) / MODES[mode]) * 100

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🍅 Pomodoro Timer</h2>

      {/* Mode switcher */}
      <div style={styles.modes}>
        {['focus', 'shortBreak', 'longBreak'].map(m => (
          <button
            key={m}
            style={{
              ...styles.modeBtn,
              backgroundColor: mode === m ? '#f5a623' : 'transparent',
              color: mode === m ? '#fff' : '#666'
            }}
            onClick={() => switchMode(m)}
          >
            {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
          </button>
        ))}
      </div>

      {/* Timer display */}
      <div style={styles.timerWrapper}>
        <svg width="160" height="160" style={styles.svg}>
          <circle cx="80" cy="80" r="70" fill="none" stroke="#f0f0f0" strokeWidth="8" />
          <circle
            cx="80" cy="80" r="70"
            fill="none"
            stroke="#f5a623"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 70}`}
            strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`}
            strokeLinecap="round"
            transform="rotate(-90 80 80)"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div style={styles.timeDisplay}>{formatTime(timeLeft)}</div>
      </div>

      {/* Task selector */}
      <select
        style={styles.select}
        value={selectedTaskId}
        onChange={e => setSelectedTaskId(e.target.value)}
      >
        <option value="">Select a task to track</option>
        {tasks.map(task => (
          <option key={task.id} value={task.id}>
            {task.title} ({Math.floor(task.timeSpent / 60)}h {task.timeSpent % 60}m spent)
          </option>
        ))}
      </select>

      {/* Controls */}
      <div style={styles.controls}>
        <button
          style={styles.mainBtn}
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? '⏸ Pause' : '▶ Start'}
        </button>
       <button
  style={styles.resetBtn}
  onClick={async () => {
    if (isRunning || timeLeft < MODES[mode]) {
      const minutesSpent = Math.floor((MODES[mode] - timeLeft) / 60)

      if (minutesSpent > 0 && selectedTaskId && mode === 'focus') {
        await fetch(`http://localhost:3000/tasks/${selectedTaskId}/time`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ minutes: minutesSpent })
        })
        onTimeLogged()
      }
    }
    setIsRunning(false)
    setTimeLeft(MODES[mode])
  }}
>
  ↺ Reset
</button>
      </div>

      <p style={styles.sessions}>🔥 {sessions} sessions completed today</p>
    </div>
  )
}
const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    border: '1px solid #e8e0d0',
    maxWidth: '360px',
    margin: '0 auto',
    textAlign: 'center'
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '16px',
    color: '#1a1a1a'
  },
  modes: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  modeBtn: {
    padding: '6px 14px',
    border: '1.5px solid #e8e0d0',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  timerWrapper: {
    position: 'relative',
    width: '160px',
    height: '160px',
    margin: '0 auto 20px'
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  timeDisplay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a1a'
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e8e0d0',
    fontSize: '13px',
    marginBottom: '16px',
    outline: 'none',
    backgroundColor: '#fffdf7',
    color: '#1a1a1a'
  },
  controls: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    marginBottom: '12px'
  },
  mainBtn: {
    padding: '10px 28px',
    backgroundColor: '#f5a623',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '700'
  },
  resetBtn: {
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: '1.5px solid #e8e0d0',
    borderRadius: '10px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#888'
  },
  sessions: {
    fontSize: '13px',
    color: '#888',
    margin: 0,
    fontWeight: '500'
  }
}
export default PomodoroTimer