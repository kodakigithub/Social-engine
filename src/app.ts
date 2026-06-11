import Fastify from 'fastify';
import { z } from 'zod';
import { Prisma } from './generated/prisma/client.js';
import { config } from './config.js';
import { authPlugin } from './plugins/auth.js';
import { accountRoutes } from './routes/accounts.js';
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

    // Handle Prisma not found errors (P2025: Record to delete does not exist)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return reply.status(404).send({
        error: 'Not found',
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
  await app.register(accountRoutes);

  return app;
}
