import "dotenv/config";

import { randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import { parseArgs } from "node:util";

import { loadAutomationConfig } from "./lib/automation-env";
import { createRepoFromTemplate } from "./lib/github";
import { createNeonProject, neonDeleteCommandHint } from "./lib/neon";
import {
  createR2ApiToken,
  createR2Bucket,
  enablePublicDevUrl,
  setBucketCors,
} from "./lib/cloudflare-r2";
import {
  attachVercelDomain,
  createVercelProject,
  setVercelEnvVars,
  type VercelEnvVar,
} from "./lib/vercel";
import { writeClientEnvFile } from "./lib/client-env-file";
import { ProgressLedger } from "./lib/progress";

const SLUG_PATTERN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

function parseCliArgs() {
  const { values } = parseArgs({
    options: {
      name: { type: "string" },
      domain: { type: "string" },
      "owner-email": { type: "string" },
      "owner-password": { type: "string" },
      public: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
    },
  });

  if (!values.name || !SLUG_PATTERN.test(values.name)) {
    throw new Error(
      "--name is required and must be a lowercase, URL-safe slug (letters, digits, hyphens).",
    );
  }

  return {
    name: values.name,
    domain: values.domain,
    ownerEmail: values["owner-email"],
    ownerPassword: values["owner-password"],
    isPrivate: !values.public,
    dryRun: values["dry-run"] ?? false,
  };
}

function generateAuthSecret(): string {
  return randomBytes(32).toString("base64url");
}

async function main() {
  const args = parseCliArgs();
  const config = loadAutomationConfig();
  const ledger = new ProgressLedger();

  const siteUrl = args.domain ? `https://${args.domain}` : `https://${args.name}.vercel.app`;

  console.log(`Provisioning new client site "${args.name}"`);
  console.log(`Site URL: ${siteUrl}`);
  if (args.dryRun) {
    console.log("\n--dry-run: no external resources will be created. Plan:");
    console.log(`  1. GitHub repo ${config.githubOwner}/${args.name} from ${config.templateOwner}/${config.templateRepo}`);
    console.log(`  2. Neon project "${args.name}"`);
    console.log(`  3. Cloudflare R2 bucket "${args.name}" (+ public URL, CORS, scoped API key)`);
    console.log(`  4. Local .env written to new-client-output/${args.name}.env`);
    console.log(`  5. Run db:migrate + seed against the new database`);
    console.log(`  6. Vercel project "${args.name}" linked to the new repo, env vars set${args.domain ? `, domain ${args.domain} attached` : ""}`);
    return;
  }

  try {
    ledger.step(`Creating GitHub repo ${config.githubOwner}/${args.name}`);
    const repo = await createRepoFromTemplate({
      token: config.githubToken,
      templateOwner: config.templateOwner,
      templateRepo: config.templateRepo,
      newOwner: config.githubOwner,
      newRepoName: args.name,
      isPrivate: args.isPrivate,
    });
    ledger.record({
      service: "github",
      description: `GitHub repo ${repo.fullName}`,
      manualCleanupUrl: `${repo.htmlUrl}/settings`,
    });

    ledger.step(`Creating Neon project "${args.name}"`);
    const neonProject = await createNeonProject({
      apiKey: config.neonApiKey,
      orgId: config.neonOrgId,
      name: args.name,
    });
    ledger.record({
      service: "neon",
      description: `Neon project ${neonProject.projectId}`,
      manualCleanupUrl: neonProject.consoleUrl,
    });

    ledger.step(`Creating Cloudflare R2 bucket "${args.name}"`);
    await createR2Bucket({
      apiToken: config.cloudflareApiToken,
      accountId: config.cloudflareAccountId,
      bucketName: args.name,
    });
    const { publicUrl } = await enablePublicDevUrl({
      apiToken: config.cloudflareApiToken,
      accountId: config.cloudflareAccountId,
      bucketName: args.name,
    });
    const corsOrigins = args.domain
      ? ["http://localhost:3000", `https://${args.domain}`]
      : ["http://localhost:3000"];
    await setBucketCors({
      apiToken: config.cloudflareApiToken,
      accountId: config.cloudflareAccountId,
      bucketName: args.name,
      allowedOrigins: corsOrigins,
    });
    const r2Keys = await createR2ApiToken({
      apiToken: config.cloudflareApiToken,
      accountId: config.cloudflareAccountId,
      bucketName: args.name,
    });
    ledger.record({
      service: "cloudflare-r2",
      description: `R2 bucket ${args.name} (public URL: ${publicUrl})`,
      manualCleanupUrl: `https://dash.cloudflare.com/${config.cloudflareAccountId}/r2/default/buckets/${args.name}`,
    });
    if (!args.domain) {
      console.log(
        "   note: no --domain given, so bucket CORS only allows localhost. " +
          "Re-run setBucketCors manually once a domain is chosen.",
      );
    }

    ledger.step("Generating AUTH_SECRET and assembling env vars");
    const authSecret = generateAuthSecret();
    const envVars: Record<string, string> = {
      DATABASE_URL: neonProject.pooledConnectionUri,
      AUTH_SECRET: authSecret,
      NEXT_PUBLIC_SITE_URL: siteUrl,
      R2_ACCOUNT_ID: config.cloudflareAccountId,
      R2_ACCESS_KEY_ID: r2Keys.accessKeyId,
      R2_SECRET_ACCESS_KEY: r2Keys.secretAccessKey,
      R2_BUCKET_NAME: args.name,
      R2_PUBLIC_URL: publicUrl,
      RESEND_API_KEY: "",
      RESEND_FROM_EMAIL: "",
      CONTACT_EMAIL_TO: "",
      NEXT_PUBLIC_CF_ANALYTICS_TOKEN: "",
    };

    const envFilePath = `new-client-output/${args.name}.env`;
    await writeClientEnvFile(envFilePath, envVars);
    console.log(`   wrote ${envFilePath}`);

    ledger.step("Running database migrations against the new Neon project");
    execFileSync("npx", ["drizzle-kit", "migrate"], {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: neonProject.pooledConnectionUri },
    });

    ledger.step("Seeding owner account + starter content");
    execFileSync("npx", ["tsx", "scripts/seed.ts"], {
      stdio: "inherit",
      env: {
        ...process.env,
        DATABASE_URL: neonProject.pooledConnectionUri,
        ...(args.ownerEmail ? { SEED_OWNER_EMAIL: args.ownerEmail } : {}),
        ...(args.ownerPassword ? { SEED_OWNER_PASSWORD: args.ownerPassword } : {}),
      },
    });

    ledger.step(`Creating Vercel project "${args.name}"`);
    const vercelProject = await createVercelProject({
      token: config.vercelApiToken,
      teamId: config.vercelTeamId,
      name: args.name,
      githubRepoFullName: repo.fullName,
    });
    ledger.record({
      service: "vercel",
      description: `Vercel project ${args.name}`,
      manualCleanupUrl: `${vercelProject.dashboardUrl}/settings`,
    });

    const encrypted: Array<keyof typeof envVars> = [
      "DATABASE_URL",
      "AUTH_SECRET",
      "R2_ACCOUNT_ID",
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
      "R2_BUCKET_NAME",
      "RESEND_API_KEY",
    ];
    const targets: VercelEnvVar["target"] = ["production", "preview", "development"];
    const vercelEnvVars: VercelEnvVar[] = Object.entries(envVars).map(([key, value]) => ({
      key,
      value,
      target: targets,
      type: encrypted.includes(key) ? "encrypted" : "plain",
    }));

    await setVercelEnvVars({
      token: config.vercelApiToken,
      teamId: config.vercelTeamId,
      projectId: vercelProject.projectId,
      vars: vercelEnvVars,
    });
    console.log("   env vars set on Vercel project");

    let domainVerification: Array<{ type: string; name: string; value: string }> = [];
    if (args.domain) {
      ledger.step(`Attaching domain ${args.domain} to Vercel project`);
      const result = await attachVercelDomain({
        token: config.vercelApiToken,
        teamId: config.vercelTeamId,
        projectId: vercelProject.projectId,
        domain: args.domain,
      });
      domainVerification = result.verificationRecords;
    }

    console.log("\nDone. Summary:");
    for (const resource of ledger.summary()) {
      console.log(`  [${resource.service}] ${resource.description}`);
    }
    console.log(`\nLocal env file: ${envFilePath}`);
    console.log(`Neon project delete command (manual, if you need to tear this down):`);
    console.log(`  ${neonDeleteCommandHint(neonProject.projectId)}`);

    console.log("\nManual steps remaining:");
    if (args.domain) {
      console.log(`  1. Add DNS records for ${args.domain} at your DNS host:`);
      if (domainVerification.length === 0) {
        console.log("     (Vercel returned no extra verification records - check the project's Domains tab.)");
      }
      for (const record of domainVerification) {
        console.log(`     ${record.type} ${record.name} -> ${record.value}`);
      }
    } else {
      console.log("  1. No domain was attached - the site is live at the *.vercel.app URL above.");
    }
    console.log("  2. Cloudflare Web Analytics token (needs the domain resolving first).");
    console.log("  3. Resend sender domain verification, if contact-form emails are needed.");
    console.log("  4. Optional custom domain for R2 media (currently using the public r2.dev URL).");
    console.log(`  5. Log in at ${siteUrl}/admin/login with the seeded owner credentials and replace placeholder content.`);
    console.log("  6. Transfer repo/project ownership or add collaborators, if applicable.");
  } catch (error) {
    ledger.fail(error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });
