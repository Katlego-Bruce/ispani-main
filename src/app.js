const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { errorHandler } = require('./middleware/errorHandler');
const { prisma } = require('./services/prisma');

// Route imports
const userRoutes = require('./modules/users/users.routes');
const jobRoutes = require('./modules/jobs/jobs.routes');
const applicationRoutes = require('./modules/applications/applications.routes');

const app = express();

// ─── Security ───────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: config.CORS_ORIGINS,
  credentials: true,
}));

// ─── Parsing ────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Logging ────────────────────────────────────────────────────
app.use(morgan('dev'));

// ─── Rate Limiting ──────────────────────────────────────────────
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
}));

// ─── Health Check ───────────────────────────────────────────────
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'disconnected';
  }
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: { database: dbStatus },
  });
});

// ─── API Routes ─────────────────────────────────────────────────
app.use('/users', userRoutes);
app.use('/jobs', jobRoutes);
app.use('/applications', applicationRoutes);

// ─── 404 Handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ───────────────────────────────────────
app.use(errorHandler);

module.exports = app;
