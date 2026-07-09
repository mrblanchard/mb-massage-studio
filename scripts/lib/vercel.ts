const VERCEL_API = "https://api.vercel.com";

function teamQuery(teamId?: string): string {
  return teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
}

async function vercelRequest(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; json: any }> {
  const res = await fetch(`${VERCEL_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

export interface CreatedVercelProject {
  projectId: string;
  dashboardUrl: string;
}

export async function createVercelProject(opts: {
  token: string;
  teamId?: string;
  name: string;
  githubRepoFullName: string;
}): Promise<CreatedVercelProject> {
  // Confirm current API version prefix (v9/v10/v11) against
  // docs.vercel.com/rest-api at implementation/run time.
  const result = await vercelRequest(
    opts.token,
    `/v11/projects${teamQuery(opts.teamId)}`,
    {
      method: "POST",
      body: JSON.stringify({
        name: opts.name,
        framework: "nextjs",
        gitRepository: { type: "github", repo: opts.githubRepoFullName },
      }),
    },
  );

  if (!result.ok) {
    throw new Error(
      `Vercel: failed to create project (${result.status}): ${JSON.stringify(result.json)}`,
    );
  }

  const projectId: string = result.json.id;
  const teamSegment = opts.teamId ? `${opts.teamId}/` : "";
  return {
    projectId,
    dashboardUrl: `https://vercel.com/${teamSegment}${opts.name}`,
  };
}

export interface VercelEnvVar {
  key: string;
  value: string;
  target: Array<"production" | "preview" | "development">;
  type?: "encrypted" | "plain";
}

export async function setVercelEnvVars(opts: {
  token: string;
  teamId?: string;
  projectId: string;
  vars: VercelEnvVar[];
}): Promise<void> {
  const result = await vercelRequest(
    opts.token,
    `/v10/projects/${opts.projectId}/env?upsert=true${
      opts.teamId ? `&teamId=${encodeURIComponent(opts.teamId)}` : ""
    }`,
    {
      method: "POST",
      body: JSON.stringify(
        opts.vars.map((v) => ({
          key: v.key,
          value: v.value,
          target: v.target,
          type: v.type ?? "encrypted",
        })),
      ),
    },
  );

  if (!result.ok) {
    throw new Error(
      `Vercel: failed to set env vars (${result.status}): ${JSON.stringify(result.json)}`,
    );
  }
}

export interface VercelDomainVerification {
  type: string;
  name: string;
  value: string;
}

export async function attachVercelDomain(opts: {
  token: string;
  teamId?: string;
  projectId: string;
  domain: string;
}): Promise<{ verificationRecords: VercelDomainVerification[] }> {
  const result = await vercelRequest(
    opts.token,
    `/v10/projects/${opts.projectId}/domains${teamQuery(opts.teamId)}`,
    { method: "POST", body: JSON.stringify({ name: opts.domain }) },
  );

  if (!result.ok) {
    throw new Error(
      `Vercel: failed to attach domain (${result.status}): ${JSON.stringify(result.json)}`,
    );
  }

  return { verificationRecords: result.json.verification ?? [] };
}
