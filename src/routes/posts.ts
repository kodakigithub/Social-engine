import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createPost, getAllPosts, getPostById, deletePost } from '../services/posts.js';

const createPostSchema = z.object({
  body: z.string().min(1).max(10000),
  targetPlatforms: z.array(z.enum(['LINKEDIN', 'X', 'FACEBOOK', 'REDDIT'])).optional(),
});

export async function postRoutes(app: FastifyInstance) {
  app.get('/posts', async () => {
    const posts = await getAllPosts();
    return { posts };
  });

  app.get('/posts/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const post = await getPostById(id);
    
    if (!post) {
      return reply.status(404).send({
        error: 'Post not found',
      });
    }
    
    return { post };
  });

  app.post('/posts', async (request, reply) => {
    const body = createPostSchema.parse(request.body);
    const post = await createPost(body.body, body.targetPlatforms);
    return reply.status(201).send({ post });
  });

  app.delete('/posts/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = await deletePost(id);
    
    if (!deleted) {
      return reply.status(404).send({
        error: 'Post not found',
      });
    }
    
    return reply.status(200).send({
      deleted: true,
    });
  });
}
