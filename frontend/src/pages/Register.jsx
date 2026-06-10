import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('All fields are required')
      return
    }

    try {
      const res = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message)
        return
      }

      navigate('/login')
    } catch (err) {
      setError('Something went wrong')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>🪐 Orbitask</h1>
        <h2 style={styles.title}>Create your account</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          style={styles.input}
          placeholder="Full name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
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

        <button style={styles.button} onClick={handleRegister}>
          Create Account
        </button>

        <p style={styles.link}>
          Already have an account? <Link to="/login">Login</Link>
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
    backgroundColor: '#fef9ec',
    fontFamily: 'inherit'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
    border: '1px solid #e8e0d0'
  },
  logo: {
    textAlign: 'center',
    fontSize: '28px',
    marginBottom: '8px'
  },
  title: {
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '8px'
  },
  subtitle: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#888',
    marginBottom: '28px'
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
    cursor: 'pointer',
    marginTop: '8px'
  },
  error: {
    color: '#e53e3e',
    fontSize: '13px',
    marginBottom: '12px',
    backgroundColor: '#fff5f5',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #fed7d7'
  },
  link: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#888'
  }
}

export default Register