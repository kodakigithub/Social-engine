import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { publishPost } from '../services/publish.js';

const publishSchema = z.object({
  accountId: z.string().min(1),
  title: z.string().optional(),
  subreddit: z.string().optional(),
});

export async function publishRoutes(app: FastifyInstance) {
  app.post('/posts/:id/publish', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = publishSchema.parse(request.body);

    const result = await publishPost(id, body.accountId, {
      title: body.title,
      subreddit: body.subreddit,
    });

    return reply.status(200).send({
      success: true,
      publication: result.publication,
      platformPostId: result.platformPostId,
    });
  });
}
