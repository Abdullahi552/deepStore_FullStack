import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

const start = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`\n🚀 DeepStore API running`);
    console.log(`   Environment: ${env.NODE_ENV}`);
    console.log(`   URL:         http://localhost:${env.PORT}`);
    console.log(`   Health:      http://localhost:${env.PORT}/api/v1/health`);
    console.log(`   Docs:        http://localhost:${env.PORT}/api-docs\n`);
  });

  // Graceful shutdown — close HTTP server and Mongo connection cleanly
  const shutdown = (signal) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    server.close(async () => {
      const { disconnectDB } = await import('./config/db.js');
      await disconnectDB();
      console.log('✅ Shutdown complete');
      process.exit(0);
    });

    // Force exit if graceful shutdown hangs
    setTimeout(() => {
      console.error('⚠️  Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

// Catch errors that escape try/catch anywhere in the app
process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

start();