import Fastify from 'fastify';
import { z } from 'zod';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Simple example route with validation
app.get('/', async () => {
  return {
    name: 'social-engine',
    version: '0.0.1',
    description: 'Multi-platform social media outreach engine',
  };
});


// Start server
const start = async () => {
  try {
    const port = 3000;
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });
    app.log.info(`Server listening on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
