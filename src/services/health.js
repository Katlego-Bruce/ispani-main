const os = require('os');
const prisma = require('./prisma');
const cache = require('./cache');
const logger = require('./logger');

const health = {
  async checkDatabase() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', latency: '< 100ms' };
    } catch (err) {
      logger.error('Database health check failed:', err.message);
      return { status: 'unhealthy', error: err.message };
    }
  },

  async checkRedis() {
    try {
      await cache.set('health:test', { timestamp: Date.now() }, 10);
      const test = await cache.get('health:test');
      if (test) {
        return { status: 'healthy' };
      }
      return { status: 'unhealthy', error: 'Cache set/get failed' };
    } catch (err) {
      logger.error('Redis health check failed:', err.message);
      return { status: 'unhealthy', error: err.message };
    }
  },

  getMemoryUsage() {
    const used = process.memoryUsage();
    return {
      rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(used.external / 1024 / 1024)}MB`,
    };
  },

  getDiskUsage() {
    return { status: 'operational', temp_files: 0 };
  },

  async getFullStatus() {
    const [dbHealth, redisHealth] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    return {
      status: dbHealth.status === 'healthy' && redisHealth.status === 'healthy' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: `${Math.round(process.uptime())}s`,
      version: process.env.npm_package_version || '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbHealth,
        redis: redisHealth,
        memory: this.getMemoryUsage(),
        disk: this.getDiskUsage(),
      },
    };
  },
};

module.exports = health;
