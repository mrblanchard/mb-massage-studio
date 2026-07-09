import { config as loadDotenv } from "dotenv";

export interface AutomationConfig {
  githubToken: string;
  githubOwner: string;
  templateOwner: string;
  templateRepo: string;
  neonApiKey: string;
  neonOrgId?: string;
  cloudflareApiToken: string;
  cloudflareAccountId: string;
  vercelApiToken: string;
  vercelTeamId?: string;
}

const REQUIRED_KEYS = [
  "AUTOMATION_GITHUB_TOKEN",
  "AUTOMATION_GITHUB_OWNER",
  "AUTOMATION_TEMPLATE_OWNER",
  "AUTOMATION_TEMPLATE_REPO",
  "AUTOMATION_NEON_API_KEY",
  "AUTOMATION_CLOUDFLARE_API_TOKEN",
  "AUTOMATION_CLOUDFLARE_ACCOUNT_ID",
  "AUTOMATION_VERCEL_API_TOKEN",
] as const;

export function loadAutomationConfig(): AutomationConfig {
  loadDotenv({ path: ".env.automation" });

  const missing = REQUIRED_KEYS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required keys in .env.automation: ${missing.join(", ")}\n` +
        "See .env.automation.example for what each key is and where to generate it.",
    );
  }

  return {
    githubToken: process.env.AUTOMATION_GITHUB_TOKEN!,
    githubOwner: process.env.AUTOMATION_GITHUB_OWNER!,
    templateOwner: process.env.AUTOMATION_TEMPLATE_OWNER!,
    templateRepo: process.env.AUTOMATION_TEMPLATE_REPO!,
    neonApiKey: process.env.AUTOMATION_NEON_API_KEY!,
    neonOrgId: process.env.AUTOMATION_NEON_ORG_ID || undefined,
    cloudflareApiToken: process.env.AUTOMATION_CLOUDFLARE_API_TOKEN!,
    cloudflareAccountId: process.env.AUTOMATION_CLOUDFLARE_ACCOUNT_ID!,
    vercelApiToken: process.env.AUTOMATION_VERCEL_API_TOKEN!,
    vercelTeamId: process.env.AUTOMATION_VERCEL_TEAM_ID || undefined,
  };
}
