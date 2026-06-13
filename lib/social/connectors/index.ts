import type { SocialPlatform } from "@/lib/social/schema";
import { NoopConnector } from "@/lib/social/connectors/noop";
import type { SocialConnector } from "@/lib/social/connectors/types";

const connectors: Record<SocialPlatform, SocialConnector> = {
  x: new NoopConnector("x"),
  facebook: new NoopConnector("facebook"),
  instagram: new NoopConnector("instagram"),
  linkedin: new NoopConnector("linkedin"),
};

export function getConnector(platform: SocialPlatform): SocialConnector {
  return connectors[platform];
}
