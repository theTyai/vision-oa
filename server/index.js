require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const path = require('path')
const connectDB = require('./config/db')

const authRoutes = require('./routes/authRoutes')
const mcqRoutes = require('./routes/mcqRoutes')
const adminRoutes = require('./routes/adminRoutes')

const app = express()
const server = http.createServer(app)

// ── Socket.io setup ───────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true }
})

// Expose io to routes via app.locals
app.locals.io = io

// Track connected sockets per user (userId -> socketId)
const onlineUsers = new Map()

io.on('connection', (socket) => {
  // Client registers their userId after connecting
  socket.on('register', (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id)
      socket.join(`user:${userId}`)
    }
  })

  socket.on('join:admin', () => {
    socket.join('admins')
  })

  socket.on('disconnect', () => {
    for (const [uid, sid] of onlineUsers) {
      if (sid === socket.id) { onlineUsers.delete(uid); break }
    }
  })
})

app.locals.onlineUsers = onlineUsers

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/mcq', mcqRoutes)
app.use('/api/admin', adminRoutes)

// Health
app.get('/api/health', (_, res) => res.json({ status: 'OK', env: process.env.NODE_ENV }))

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }))

// Error
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: 'Internal server error' })
})

// ── Start ─────────────────────────────────────────────────────────────────────
connectDB().then(() => {
  const PORT = process.env.PORT || 5000
  server.listen(PORT, () => {
    console.log(`\n🚀  Vision OA Server  →  http://localhost:${PORT}`)
    console.log(`🌍  Environment       →  ${process.env.NODE_ENV || 'development'}\n`)
  })
})

module.exports = { app, io }
