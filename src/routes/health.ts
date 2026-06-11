import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { checkDatabaseConnection } from '../infrastructure/prisma.js';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    const dbConnected = await checkDatabaseConnection();
    return {
      status: 'ok',
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  });

  app.get('/', async () => {
    return {
      name: 'social-engine',
      version: '1.0.0',
      description: 'Multi-platform social media outreach engine',
      endpoints: ['/health', '/posts'],
    };
  });
}
