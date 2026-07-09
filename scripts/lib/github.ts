const GITHUB_API = "https://api.github.com";

async function githubRequest(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  return res;
}

export interface CreatedRepo {
  htmlUrl: string;
  fullName: string;
  cloneUrl: string;
  sshUrl: string;
}

export async function createRepoFromTemplate(opts: {
  token: string;
  templateOwner: string;
  templateRepo: string;
  newOwner: string;
  newRepoName: string;
  isPrivate?: boolean;
}): Promise<CreatedRepo> {
  const res = await githubRequest(
    opts.token,
    `/repos/${opts.templateOwner}/${opts.templateRepo}/generate`,
    {
      method: "POST",
      body: JSON.stringify({
        owner: opts.newOwner,
        name: opts.newRepoName,
        include_all_branches: false,
        private: opts.isPrivate ?? true,
      }),
    },
  );

  if (!res.ok) {
    throw new Error(
      `GitHub: failed to generate repo from template (${res.status}): ${await res.text()}`,
    );
  }

  await waitForRepoContent(opts.token, opts.newOwner, opts.newRepoName);

  const data = await res.json();
  return {
    htmlUrl: data.html_url,
    fullName: data.full_name,
    cloneUrl: data.clone_url,
    sshUrl: data.ssh_url,
  };
}

async function waitForRepoContent(
  token: string,
  owner: string,
  name: string,
  attempts = 10,
  delayMs = 2000,
): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    const res = await githubRequest(token, `/repos/${owner}/${name}/contents`);
    if (res.ok) return;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error(
    `GitHub: repo ${owner}/${name} did not finish generating content in time`,
  );
}
