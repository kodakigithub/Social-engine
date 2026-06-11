import { prisma } from '../infrastructure/prisma.js';

export async function getAllAccounts() {
  return prisma.account.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getAccountById(id: string) {
  return prisma.account.findUnique({
    where: { id },
  });
}

export async function createAccount(
  platform: string,
  name: string,
  credentials: Record<string, unknown>
) {
  return prisma.account.create({
    data: {
      platform,
      name,
      credentials,
    },
  });
}

export async function deleteAccount(id: string) {
  const account = await prisma.account.findUnique({
    where: { id },
  });

  if (!account) {
    return null;
  }

  return prisma.account.delete({
    where: { id },
  });
}
