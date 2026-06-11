import type { SocialPlatform, PublishContent, PublishResult } from './base.js';

export class LinkedInAdapter implements SocialPlatform {
  name = 'LINKEDIN';

  async publish(content: PublishContent, credentials: Record<string, unknown>): Promise<PublishResult> {
    const accessToken = credentials.accessToken as string;
    const organizationId = credentials.organizationId as string;

    if (!accessToken) {
      throw new Error('LinkedIn access token not found in credentials');
    }

    if (!organizationId) {
      throw new Error('LinkedIn organization ID not found in credentials');
    }

    const author = `urn:li:organization:${organizationId}`;

    const response = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202306',
      },
      body: JSON.stringify({
        author,
        lifecycleState: 'PUBLISHED',
        visibility: 'PUBLIC',
        commentary: content.body,
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LinkedIn API error: ${response.status} ${errorText}`);
    }

    const platformPostId = response.headers.get('x-restli-id') || 'unknown';

    return {
      platformPostId,
    };
  }
}

export const linkedInAdapter = new LinkedInAdapter();
