import Fastify from 'fastify';
import { z } from 'zod';
import { config } from './config.js';
import { authPlugin } from './plugins/auth.js';
import { healthRoutes } from './routes/health.js';
import { postRoutes } from './routes/posts.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
    },
  });

  // Error handler
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    app.log.error(error);
    return reply.status(500).send({
      error: 'Internal server error',
    });
  });

  // Register plugins
  await app.register(authPlugin);
  await app.register(healthRoutes);
  await app.register(postRoutes);

  return app;
}
