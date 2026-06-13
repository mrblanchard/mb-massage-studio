import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

import { auth } from "@/auth";
import { EditModeToggle } from "@/components/edit/edit-mode-toggle";
import { getSiteSettings } from "@/lib/db/queries/site-settings";
import { EditModeProvider } from "@/lib/edit/edit-mode-context";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return settings?.faviconUrl ? { icons: { icon: settings.faviconUrl } } : {};
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, session] = await Promise.all([getSiteSettings(), auth()]);
  const siteName = settings?.siteName || "Your Business";
  const navLinks = settings?.navLinks ?? [];
  const cfAnalyticsToken =
    settings?.cfAnalyticsToken || process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN || "";

  return (
    <EditModeProvider canEdit={!!session?.user}>
      {cfAnalyticsToken && (
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="afterInteractive"
          data-cf-beacon={JSON.stringify({ token: cfAnalyticsToken })}
        />
      )}
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            {settings?.logoUrl ? (
              <Image
                src={settings.logoUrl}
                alt={siteName}
                width={160}
                height={40}
                unoptimized
                className="h-8 w-auto object-contain"
              />
            ) : (
              siteName
            )}
          </Link>
          {navLinks.length > 0 && (
            <nav className="flex items-center gap-6 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
      </footer>
      <EditModeToggle />
    </EditModeProvider>
  );
}
