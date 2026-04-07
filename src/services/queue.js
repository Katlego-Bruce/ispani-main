const Queue = require('bull');
const logger = require('./logger');

const emailQueue = new Queue('emails', {
  redis: { host: process.env.REDIS_HOST || 'localhost', port: process.env.REDIS_PORT || 6379 },
});

const smsQueue = new Queue('sms', {
  redis: { host: process.env.REDIS_HOST || 'localhost', port: process.env.REDIS_PORT || 6379 },
});

const paymentQueue = new Queue('payments', {
  redis: { host: process.env.REDIS_HOST || 'localhost', port: process.env.REDIS_PORT || 6379 },
});

const notificationQueue = new Queue('notifications', {
  redis: { host: process.env.REDIS_HOST || 'localhost', port: process.env.REDIS_PORT || 6379 },
});

const queues = [emailQueue, smsQueue, paymentQueue, notificationQueue];

queues.forEach((queue) => {
  queue.on('error', (err) => {
    logger.error(`Queue ${queue.name} error:`, err.message);
  });
  queue.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed:`, err.message);
  });
  queue.on('completed', (job) => {
    logger.info(`Job ${job.id} completed`);
  });
});

module.exports = { emailQueue, smsQueue, paymentQueue, notificationQueue };
