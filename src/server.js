const app = require('./app');
const config = require('./config');

const PORT = config.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Ispani API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
