import type { SocialPlatform, PublishContent, PublishResult } from './base.js';

export class RedditAdapter implements SocialPlatform {
  name = 'REDDIT';

  async publish(content: PublishContent, credentials: Record<string, unknown>): Promise<PublishResult> {
    const accessToken = credentials.accessToken as string;
    const subreddit = content.subreddit || credentials.subreddit as string;

    if (!accessToken) {
      throw new Error('Reddit access token not found in credentials');
    }

    if (!subreddit) {
      throw new Error('Subreddit not specified. Provide it in the publish request or account credentials.');
    }

    const title = content.title || content.body.substring(0, 100);
    const text = content.body;

    const response = await fetch('https://oauth.reddit.com/api/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'social-engine/1.0 (by /u/social-engine)',
      },
      body: new URLSearchParams({
        sr: subreddit,
        kind: 'self',
        title: title,
        text: text,
        api_type: 'json',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Reddit API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (data.json && data.json.errors && data.json.errors.length > 0) {
      throw new Error(`Reddit API error: ${JSON.stringify(data.json.errors)}`);
    }

    const postId = data.json?.data?.id || 'unknown';

    return {
      platformPostId: postId,
      url: `https://www.reddit.com/r/${subreddit}/comments/${postId}/`,
    };
  }
}

export const redditAdapter = new RedditAdapter();
