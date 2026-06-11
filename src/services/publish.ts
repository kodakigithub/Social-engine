import { prisma } from '../infrastructure/prisma.js';
import { linkedInAdapter } from '../platforms/linkedin.js';
import { redditAdapter } from '../platforms/reddit.js';

const adapters = {
  LINKEDIN: linkedInAdapter,
  REDDIT: redditAdapter,
};

export async function publishPost(
  postId: string,
  accountId: string,
  options?: { title?: string; subreddit?: string }
) {
  // Get post
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  // Get account
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new Error('Account not found');
  }

  // Get adapter
  const adapter = adapters[account.platform as keyof typeof adapters];

  if (!adapter) {
    throw new Error(`Platform ${account.platform} not supported`);
  }

  // Publish to platform
  const result = await adapter.publish(
    {
      body: post.body,
      title: options?.title,
      subreddit: options?.subreddit,
    },
    account.credentials as Record<string, unknown>
  );

  // Create publication record
  const publication = await prisma.publication.create({
    data: {
      postId: post.id,
      platform: account.platform,
      status: 'published',
    },
  });

  return {
    publication,
    platformPostId: result.platformPostId,
  };
}
