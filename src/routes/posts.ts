import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../infrastructure/prisma.js';

const createPostSchema = z.object({
  body: z.string().min(1).max(10000),
});

export async function postRoutes(app: FastifyInstance) {
  app.get('/posts', async () => {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { posts };
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
}
