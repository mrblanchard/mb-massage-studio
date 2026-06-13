import type { SocialPlatform } from "@/lib/social/schema";

export interface SocialPostPayload {
  content: string;
  mediaUrls: string[];
}

export interface PublishResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

export interface SocialConnector {
  platform: SocialPlatform;
  publish(post: SocialPostPayload): Promise<PublishResult>;
}
