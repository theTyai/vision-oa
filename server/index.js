require('dotenv').config()
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const mcqRoutes = require('./routes/mcqRoutes');
const codingRoutes = require('./routes/codingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mcq', mcqRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Vision OA Server Running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Vision OA Server → http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

module.exports = app;

// ── TEMP DEBUG: verify admin exists (remove after confirming login works) ─────
app.get('/api/debug/admin-check', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') return res.status(404).end()
  const User = require('./models/User')
  const admin = await User.findOne({ role: 'admin' }).select('+password')
  if (!admin) return res.json({ found: false, message: 'No admin user in DB — run npm run seed:fresh' })
  const bcrypt = require('bcryptjs')
  const passwordOk = await bcrypt.compare('Admin@123', admin.password)
  res.json({
    found: true,
    email: admin.email,
    role: admin.role,
    passwordHashPresent: !!admin.password,
    defaultPasswordWorks: passwordOk,
    tip: passwordOk ? 'Login should work ✅' : '❌ Password hash is wrong — run npm run seed:fresh to recreate admin'
  })
})
