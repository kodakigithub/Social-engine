import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createAccount, getAllAccounts, getAccountById, deleteAccount } from '../services/accounts.js';

const createAccountSchema = z.object({
  platform: z.enum(['LINKEDIN', 'X', 'FACEBOOK', 'REDDIT']),
  name: z.string().min(1).max(100),
  credentials: z.record(z.unknown()),
});

export async function accountRoutes(app: FastifyInstance) {
  app.get('/accounts', async () => {
    const accounts = await getAllAccounts();
    return { accounts };
  });

  app.get('/accounts/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const account = await getAccountById(id);

    if (!account) {
      return reply.status(404).send({
        error: 'Account not found',
      });
    }

    return { account };
  });

  app.post('/accounts', async (request, reply) => {
    const body = createAccountSchema.parse(request.body);
    const account = await createAccount(body.platform, body.name, body.credentials);
    return reply.status(201).send({ account });
  });

  app.delete('/accounts/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = await deleteAccount(id);

    if (!deleted) {
      return reply.status(404).send({
        error: 'Account not found',
      });
    }

    return reply.status(200).send({
      deleted: true,
    });
  });
}
