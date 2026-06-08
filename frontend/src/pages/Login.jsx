import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email || !password) {
      setError('All fields are required')
      return
    }

    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message)
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('name', data.name)
      navigate('/dashboard')
    } catch (err) {
      setError('Something went wrong')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>🪐 Orbitask</h1>
        <h2 style={styles.title}>Welcome back</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          style={styles.input}
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={handleLogin}>
          Login
        </button>

        <p style={styles.link}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f4f0',
    fontFamily: 'sans-serif'
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
  },
  logo: {
    textAlign: 'center',
    fontSize: '24px',
    marginBottom: '8px'
  },
  title: {
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '24px'
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '12px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    fontSize: '15px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#5c4ff6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    cursor: 'pointer',
    marginTop: '8px'
  },
  error: {
    color: '#e53e3e',
    fontSize: '14px',
    marginBottom: '12px'
  },
  link: {
    textAlign: 'center',
    marginTop: '16px',
    fontSize: '14px',
    color: '#666'
  }
}

export default Login