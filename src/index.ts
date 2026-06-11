import 'dotenv/config';
import Fastify from 'fastify';
import { z } from 'zod';
import { checkDatabaseConnection, prisma, disconnectPrisma } from './infrastructure/prisma.js';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Health check
app.get('/health', async () => {
  const dbConnected = await checkDatabaseConnection();
  return {
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  };
});

// Info endpoint
app.get('/', async () => {
  return {
    name: 'social-engine',
    version: '1.0.0',
    description: 'Multi-platform social media outreach engine',
    endpoints: ['/health', '/posts'],
  };
});

// Get all posts
app.get('/posts', async () => {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return { posts };
});

// Create post
const createPostSchema = z.object({
  body: z.string().min(1).max(10000),
});

app.post('/posts', async (request, reply) => {
  const body = createPostSchema.parse(request.body);

  const post = await prisma.post.create({
    data: {
      body: body.body,
    },
  });

  return reply.status(201).send({ post });
});

// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';

    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      app.log.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    app.log.info('Database connected successfully');

    await app.listen({ port, host });
    app.log.info(`Server listening on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

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

start();
