require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Orbitask API is running 🪐' })
})

// Register
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    })

    res.status(201).json({ message: 'Account created!', userId: user.id })

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Email already in use' })
    }
    res.status(500).json({ message: 'Something went wrong' })
  }
})

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body

  console.log('Login attempt:', email)

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    console.log('User found:', user)

    if (!user) return res.status(404).json({ message: 'User not found' })

    const isMatch = await bcrypt.compare(password, user.password)
    console.log('Password match:', isMatch)

    if (!isMatch) return res.status(401).json({ message: 'Wrong password' })

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ message: 'Login successful', token, name: user.name })

  } catch (error) {
    console.log('Login error:', error)
    res.status(500).json({ message: 'Something went wrong' })
  }
})

// Protect middleware
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

// Get all tasks
app.get('/tasks', protect, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId }
    })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
})

// Create a task
app.post('/tasks', protect, async (req, res) => {
  const { title, description, priority, tags } = req.body

  if (!title) return res.status(400).json({ message: 'Title is required' })

  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'medium',
        tags: tags || [],
        userId: req.userId
      }
    })
    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
})

// Update a task
app.put('/tasks/:id', protect, async (req, res) => {
  const id = Number(req.params.id)
  const { title, description, status, priority, tags } = req.body

  try {
    const task = await prisma.task.update({
      where: { id },
      data: { title, description, status, priority, tags }
    })
    res.json(task)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
})

// Delete a task
app.delete('/tasks/:id', protect, async (req, res) => {
  const id = Number(req.params.id)

  try {
    await prisma.task.delete({ where: { id } })
    res.json({ message: 'Task deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
  }
})

app.listen(3000, () => console.log('Orbitask API running on port 3000 🪐'))