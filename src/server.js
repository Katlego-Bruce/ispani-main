const app = require('./app');
const config = require('./config');
const { prisma } = require('./services/prisma');

const PORT = config.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Ispani API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Server closed. DB disconnected.');
    process.exit(0);
  });
  setTimeout(() => { process.exit(1); }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
