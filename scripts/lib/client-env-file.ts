import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ENV_KEY_ORDER = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXT_PUBLIC_SITE_URL",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_URL",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "CONTACT_EMAIL_TO",
  "NEXT_PUBLIC_CF_ANALYTICS_TOKEN",
] as const;

export function buildEnvFileContents(vars: Record<string, string>): string {
  return (
    ENV_KEY_ORDER.map((key) => `${key}="${vars[key] ?? ""}"`).join("\n") + "\n"
  );
}

export async function writeClientEnvFile(
  filePath: string,
  vars: Record<string, string>,
): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buildEnvFileContents(vars), "utf8");
}
