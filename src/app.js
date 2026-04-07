const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { errorHandler } = require('./middleware/errorHandler');
const { prisma } = require('./services/prisma');

const userRoutes = require('./modules/users/users.routes');
const jobRoutes = require('./modules/jobs/jobs.routes');
const applicationRoutes = require('./modules/applications/applications.routes');
const reviewRoutes = require('./modules/reviews/reviews.routes');
const disputeRoutes = require('./modules/disputes/disputes.routes');
const consentRoutes = require('./modules/consent/consent.routes');
const notificationRoutes = require('./modules/notifications/notifications.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGINS, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60 * 1000, max: 100, message: { error: 'Too many requests, please try again later.' } }));

app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try { await prisma.$queryRaw`SELECT 1`; dbStatus = 'connected'; } catch (err) { dbStatus = 'disconnected'; }
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.0', services: { database: dbStatus } });
});

const v1 = express.Router();
v1.use('/users', userRoutes);
v1.use('/jobs', jobRoutes);
v1.use('/applications', applicationRoutes);
v1.use('/reviews', reviewRoutes);
v1.use('/disputes', disputeRoutes);
v1.use('/consent', consentRoutes);
v1.use('/notifications', notificationRoutes);
app.use('/api/v1', v1);

// Legacy routes (backward compat)
app.use('/users', userRoutes);
app.use('/jobs', jobRoutes);
app.use('/applications', applicationRoutes);

app.use((req, res) => { res.status(404).json({ error: 'Route not found' }); });
app.use(errorHandler);

module.exports = app;
