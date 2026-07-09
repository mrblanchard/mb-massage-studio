import { getPageBySlug } from "@/lib/db/queries/pages";
import { getSiteSettings } from "@/lib/db/queries/site-settings";
import { sectionRegistry } from "@/lib/sections/registry";

import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const [settings, homePage] = await Promise.all([
    getSiteSettings(),
    getPageBySlug(""),
  ]);

  const homeSections = (homePage?.sections ?? []).map((s) => ({
    id: s.id,
    label: sectionRegistry[s.type]?.label ?? s.type,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Site Settings</h1>
        <p className="text-muted-foreground">
          These details power your site&apos;s branding, navigation, and
          contact information.
        </p>
      </div>
      <SettingsForm settings={settings} homeSections={homeSections} />
    </div>
  );
}
