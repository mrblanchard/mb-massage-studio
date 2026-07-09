export interface CreatedResource {
  service: "github" | "neon" | "cloudflare-r2" | "vercel";
  description: string;
  manualCleanupUrl?: string;
}

export class ProgressLedger {
  private created: CreatedResource[] = [];

  step(label: string): void {
    console.log(`\n-> ${label}...`);
  }

  record(resource: CreatedResource): void {
    this.created.push(resource);
    console.log(`   created: ${resource.description}`);
  }

  fail(error: unknown): never {
    console.error("\nnew-client.ts failed partway through.\n");
    console.error(error instanceof Error ? error.stack ?? error.message : error);

    if (this.created.length > 0) {
      console.error("\nResources already created (clean up manually if needed):");
      for (const resource of this.created) {
        const link = resource.manualCleanupUrl ? ` -> ${resource.manualCleanupUrl}` : "";
        console.error(`  [${resource.service}] ${resource.description}${link}`);
      }
    } else {
      console.error("\nNo external resources were created yet.");
    }

    process.exit(1);
  }

  summary(): CreatedResource[] {
    return this.created;
  }
}
