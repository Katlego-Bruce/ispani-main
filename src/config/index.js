require('dotenv').config();

const config = {
  PORT: parseInt(process.env.PORT, 10) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGINS: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'],
};

if (!config.DATABASE_URL) {
  console.error('\u274c DATABASE_URL is required.');
  process.exit(1);
}

if (!config.JWT_SECRET) {
  console.error('\u274c JWT_SECRET is required. Never use a default secret.');
  process.exit(1);
}

module.exports = config;
