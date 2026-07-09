const CLOUDFLARE_API = "https://api.cloudflare.com/client/v4";

async function cloudflareRequest(
  apiToken: string,
  path: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; json: any }> {
  const res = await fetch(`${CLOUDFLARE_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok && json.success !== false, status: res.status, json };
}

export async function createR2Bucket(opts: {
  apiToken: string;
  accountId: string;
  bucketName: string;
}): Promise<void> {
  const result = await cloudflareRequest(
    opts.apiToken,
    `/accounts/${opts.accountId}/r2/buckets`,
    { method: "POST", body: JSON.stringify({ name: opts.bucketName }) },
  );
  if (!result.ok) {
    throw new Error(
      `Cloudflare R2: failed to create bucket (${result.status}): ${JSON.stringify(result.json)}`,
    );
  }
}

export async function enablePublicDevUrl(opts: {
  apiToken: string;
  accountId: string;
  bucketName: string;
}): Promise<{ publicUrl: string }> {
  const result = await cloudflareRequest(
    opts.apiToken,
    `/accounts/${opts.accountId}/r2/buckets/${opts.bucketName}/domains/managed`,
    { method: "PUT", body: JSON.stringify({ enabled: true }) },
  );
  if (!result.ok) {
    throw new Error(
      `Cloudflare R2: failed to enable public r2.dev URL (${result.status}): ${JSON.stringify(result.json)}`,
    );
  }
  const domain: string | undefined = result.json.result?.domain;
  if (!domain) {
    throw new Error("Cloudflare R2: no public domain returned when enabling r2.dev access");
  }
  return { publicUrl: `https://${domain}` };
}

export async function setBucketCors(opts: {
  apiToken: string;
  accountId: string;
  bucketName: string;
  allowedOrigins: string[];
}): Promise<void> {
  const result = await cloudflareRequest(
    opts.apiToken,
    `/accounts/${opts.accountId}/r2/buckets/${opts.bucketName}/cors`,
    {
      method: "PUT",
      body: JSON.stringify({
        rules: [
          {
            allowed: {
              origins: opts.allowedOrigins,
              methods: ["GET", "PUT", "HEAD"],
            },
            exposeHeaders: [],
            maxAgeSeconds: 3600,
          },
        ],
      }),
    },
  );
  if (!result.ok) {
    throw new Error(
      `Cloudflare R2: failed to set CORS policy (${result.status}): ${JSON.stringify(result.json)}`,
    );
  }
}

/**
 * Mints a bucket-scoped S3-compatible access key pair. The secret is only
 * ever shown once at creation time by Cloudflare's API, so callers must
 * persist it immediately.
 *
 * NOTE: verify this endpoint against developers.cloudflare.com/r2/api/tokens/
 * at implementation/run time -- Cloudflare has changed how R2 API tokens are
 * issued in the past (Account API Tokens vs. a dedicated R2 tokens endpoint).
 */
export async function createR2ApiToken(opts: {
  apiToken: string;
  accountId: string;
  bucketName: string;
}): Promise<{ accessKeyId: string; secretAccessKey: string }> {
  const result = await cloudflareRequest(
    opts.apiToken,
    `/accounts/${opts.accountId}/r2/buckets/${opts.bucketName}/tokens`,
    {
      method: "POST",
      body: JSON.stringify({
        permission: "object-read-write",
        name: `${opts.bucketName}-automation`,
      }),
    },
  );
  if (!result.ok) {
    throw new Error(
      `Cloudflare R2: failed to create scoped API token (${result.status}): ${JSON.stringify(result.json)}`,
    );
  }
  const accessKeyId: string | undefined = result.json.result?.accessKeyId;
  const secretAccessKey: string | undefined = result.json.result?.secretAccessKey;
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("Cloudflare R2: token creation response missing access key pair");
  }
  return { accessKeyId, secretAccessKey };
}
