import 'dotenv/config';
import { buildApp } from './app.js';
import { config } from './config.js';
import { checkDatabaseConnection, disconnectPrisma } from './infrastructure/prisma.js';

async function start() {
  const app = await buildApp();

  try {
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      app.log.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    app.log.info('Database connected successfully');

    await app.listen({
      port: config.PORT,
      host: config.HOST,
    });
    app.log.info(`Server listening on http://${config.HOST}:${config.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    app.log.info('SIGTERM received, shutting down gracefully');
    await app.close();
    await disconnectPrisma();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    app.log.info('SIGINT received, shutting down gracefully');
    await app.close();
    await disconnectPrisma();
    process.exit(0);
  });
}

start();
