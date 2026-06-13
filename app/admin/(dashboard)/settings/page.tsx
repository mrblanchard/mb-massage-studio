import { getSiteSettings } from "@/lib/db/queries/site-settings";

import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Site Settings</h1>
        <p className="text-muted-foreground">
          These details power your site&apos;s branding, navigation, and
          contact information.
        </p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
