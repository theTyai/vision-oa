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

// ── CORS — support multiple allowed origins via comma-separated CLIENT_URL ────
// Example: CLIENT_URL=https://vision-oa.onrender.com,http://localhost:5173
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-side)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    console.warn(`⚠️  CORS blocked origin: ${origin}`)
    callback(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true
}

// ── Socket.io setup ───────────────────────────────────────────────────────────
<<<<<<< HEAD
const io = new Server(server, { cors: corsOptions })
=======
const io = new Server(server, {
  cors: {
    origin: "*"
  }
})
>>>>>>> 90aded2d8cf745cbcbeea35ee413dd0703dbfd2e

// Expose io to routes via app.locals
app.locals.io = io

// Track connected sockets per user (userId -> socketId)
const onlineUsers = new Map()

io.on('connection', (socket) => {
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
<<<<<<< HEAD
app.use(cors(corsOptions))
=======
app.use(cors({
  origin: "*"
}))
>>>>>>> 90aded2d8cf745cbcbeea35ee413dd0703dbfd2e
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/mcq', mcqRoutes)
app.use('/api/admin', adminRoutes)

// Health — also shows CORS config for debugging
app.get('/api/health', (_, res) => res.json({
  status: 'OK',
  env: process.env.NODE_ENV,
  allowedOrigins
}))

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

  // Warn about missing critical env vars
  const required = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL']
  required.forEach(key => {
    if (!process.env[key]) console.warn(`⚠️  Missing env var: ${key}`)
  })
  if (process.env.JWT_SECRET === 'replace_this_with_a_long_random_secret_string') {
    console.warn('⚠️  JWT_SECRET is still the placeholder — set a real secret in Railway env vars!')
  }

  server.listen(PORT, () => {
    console.log(`\n🚀  Vision OA Server  →  http://localhost:${PORT}`)
    console.log(`🌍  Environment       →  ${process.env.NODE_ENV || 'development'}`)
    console.log(`🔒  Allowed origins   →  ${allowedOrigins.join(', ')}\n`)
  })
})

module.exports = { app, io }
