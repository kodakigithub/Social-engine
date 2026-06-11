import 'dotenv/config';
import { prisma } from './prisma';

async function seed() {
  console.log('Starting database seed...');

  // Create a test account
  const account = await prisma.account.create({
    data: {
      platform: 'LINKEDIN',
      name: 'Test LinkedIn Account',
      credentials: {
        accessToken: 'test-token',
      },
    },
  });
  console.log('Created account:', account.id);

  // Create a test post
  const post = await prisma.post.create({
    data: {
      body: 'Hello from social-engine! This is a test post.',
    },
  });
  console.log('Created post:', post.id);

  // Create a test publication
  const publication = await prisma.publication.create({
    data: {
      postId: post.id,
      platform: 'LINKEDIN',
    },
  });
  console.log('Created publication:', publication.id);

  console.log('Seed completed successfully!');
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
