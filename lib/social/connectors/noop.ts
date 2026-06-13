import type { SocialPlatform } from "@/lib/social/schema";
import type { PublishResult, SocialConnector } from "@/lib/social/connectors/types";

/**
 * Placeholder connector for platforms that don't have a real integration yet.
 * Swap in a real connector (implementing the same interface) once a platform's
 * API credentials are available, then register it in connectors/index.ts.
 */
export class NoopConnector implements SocialConnector {
  constructor(public readonly platform: SocialPlatform) {}

  async publish(): Promise<PublishResult> {
    return {
      success: false,
      error: `No connector configured for ${this.platform}.`,
    };
  }
}
