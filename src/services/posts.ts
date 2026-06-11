import { prisma } from '../infrastructure/prisma.js';

export async function getAllPosts() {
  return prisma.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
  });
}

export async function createPost(body: string, targetPlatforms?: string[]) {
  return prisma.post.create({
    data: {
      body,
      targetPlatforms: targetPlatforms as any,
    },
  });
}

export async function deletePost(id: string) {
  // Check if post exists first
  const post = await prisma.post.findUnique({
    where: { id },
  });
  
  if (!post) {
    return null;
  }
  
  return prisma.post.delete({
    where: { id },
  });
}
