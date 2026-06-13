export function getSiteUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return siteUrl.replace(/\/$/, "");
}
