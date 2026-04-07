const Redis = require('ioredis');
const logger = require('./logger');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: null,
});

redis.on('error', (err) => {
  logger.error('Redis connection error:', err.message);
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

const cache = {
  async get(key) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      logger.error(`Cache get error for key ${key}:`, err.message);
      return null;
    }
  },

  async set(key, value, ttl = 3600) {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await redis.setex(key, ttl, serialized);
      } else {
        await redis.set(key, serialized);
      }
    } catch (err) {
      logger.error(`Cache set error for key ${key}:`, err.message);
    }
  },

  async del(key) {
    try {
      await redis.del(key);
    } catch (err) {
      logger.error(`Cache delete error for key ${key}:`, err.message);
    }
  },

  async invalidatePattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (err) {
      logger.error(`Cache pattern invalidation error:`, err.message);
    }
  },

  getUserKey: (userId) => `user:${userId}`,
  getJobKey: (jobId) => `job:${jobId}`,
  getJobsNearbyKey: (lat, lng, radius) => `jobs:nearby:${lat}:${lng}:${radius}`,
  getKycKey: (userId) => `kyc:${userId}`,
};

module.exports = cache;
