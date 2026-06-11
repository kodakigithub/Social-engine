// Platform adapter interface
export interface SocialPlatform {
  name: string;
  publish(content: PublishContent, credentials: Record<string, unknown>): Promise<PublishResult>;
}

export interface PublishContent {
  body: string;
  title?: string;
  subreddit?: string;
}

export interface PublishResult {
  platformPostId: string;
  url?: string;
}
