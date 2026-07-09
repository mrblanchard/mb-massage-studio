const NEON_API = "https://console.neon.tech/api/v2";

export interface CreatedNeonProject {
  projectId: string;
  pooledConnectionUri: string;
  databaseName: string;
  consoleUrl: string;
}

export async function createNeonProject(opts: {
  apiKey: string;
  orgId?: string;
  name: string;
  regionId?: string;
}): Promise<CreatedNeonProject> {
  const res = await fetch(`${NEON_API}/projects`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      project: {
        name: opts.name,
        org_id: opts.orgId,
        region_id: opts.regionId ?? "aws-us-east-1",
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Neon: failed to create project (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  const projectId: string = data.project.id;
  const databaseName: string = data.databases?.[0]?.name ?? "neondb";

  let pooledConnectionUri: string = data.connection_uris?.[0]?.connection_uri;
  if (!pooledConnectionUri) {
    throw new Error("Neon: no connection URI returned for new project");
  }
  if (!pooledConnectionUri.includes("-pooler")) {
    // Fall back to constructing the pooled host if the API ever returns the
    // direct (non-pooled) URI instead.
    pooledConnectionUri = pooledConnectionUri.replace(
      /@([^./]+)\./,
      "@$1-pooler.",
    );
  }

  return {
    projectId,
    pooledConnectionUri,
    databaseName,
    consoleUrl: `https://console.neon.tech/app/projects/${projectId}`,
  };
}

/**
 * Prints a copy-pasteable cleanup command. Never called automatically —
 * deleting a database should always be a deliberate, manual action.
 */
export function neonDeleteCommandHint(projectId: string): string {
  return `curl -X DELETE "${NEON_API}/projects/${projectId}" -H "Authorization: Bearer $AUTOMATION_NEON_API_KEY"`;
}
