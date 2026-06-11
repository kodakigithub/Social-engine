import type { FastifyInstance } from 'fastify';
import { config } from '../config.js';

export async function authPlugin(app: FastifyInstance) {
  app.addHook('onRequest', async (request, reply) => {
    // Skip auth for health check
    if (request.url === '/health') {
      return;
    }

    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing x-api-key header',
      });
    }

    if (apiKey !== config.API_KEY) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid API key',
      });
    }
  });
}
