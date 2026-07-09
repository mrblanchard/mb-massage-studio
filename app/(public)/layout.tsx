import type { Metadata } from "next";
import Script from "next/script";

import { auth } from "@/auth";
import { EditModeToggle } from "@/components/edit/edit-mode-toggle";
import { FooterEditWrapper } from "@/components/edit/footer-edit-wrapper";
import { HeaderEditWrapper } from "@/components/edit/header-edit-wrapper";
import { StyleSidebar } from "@/components/edit/style-sidebar";
import { MobileTopBar } from "@/components/mobile-top-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteSidebar } from "@/components/site-sidebar";
import { SiteStyleWrapper } from "@/components/site-style-wrapper";
import { getPageBySlug } from "@/lib/db/queries/pages";
import { getSiteSettings } from "@/lib/db/queries/site-settings";
import { EditModeProvider } from "@/lib/edit/edit-mode-context";
import type { ScrollTransition } from "@/components/nav-links";
import { sectionRegistry } from "@/lib/sections/registry";
import type { StyleSettingsValues } from "@/lib/theme/typography-schema";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return settings?.faviconUrl ? { icons: { icon: settings.faviconUrl } } : {};
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, session, homePage] = await Promise.all([
    getSiteSettings(),
    auth(),
    getPageBySlug(""),
  ]);
  const homeSections = (homePage?.sections ?? []).map((s) => ({
    id: s.id,
    label: sectionRegistry[s.type]?.label ?? s.type,
  }));
  const siteName = settings?.siteName || "Your Business";
  const navLinks = settings?.navLinks ?? [];
  const cfAnalyticsToken =
    settings?.cfAnalyticsToken || process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN || "";

  const enableSidebar = settings?.enableSidebarNav ?? false;
  const sidebarPos = (settings?.sidebarNavPosition ?? "left") as "left" | "right";
  const socialLinks = settings?.socialLinks as Record<string, string> | undefined;
  const headerCta =
    settings?.headerCtaLabel && settings?.headerCtaHref
      ? { label: settings.headerCtaLabel, href: settings.headerCtaHref }
      : null;
  const scrollTransition = (settings?.navScrollTransition as ScrollTransition) ?? "medium";
  const headerSticky = settings?.headerSticky ?? true;

  const initialStyleSettings: StyleSettingsValues = {
    fontHeading: settings?.fontHeading ?? "Inter",
    fontBody: settings?.fontBody ?? "Inter",
    baseFontSize: (settings?.baseFontSize as "small" | "medium" | "large") ?? "medium",
    typography: settings?.typography ?? {},
  };

  return (
    <EditModeProvider canEdit={!!session?.user} initialStyleSettings={initialStyleSettings}>
      {cfAnalyticsToken && (
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="afterInteractive"
          data-cf-beacon={JSON.stringify({ token: cfAnalyticsToken })}
        />
      )}

      {/* Skip-to-content link for keyboard / AT users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>

      <SiteStyleWrapper>
        {enableSidebar && sidebarPos === "left" && (
          <SiteSidebar
            siteName={siteName}
            logoUrl={settings?.logoUrl}
            navLinks={navLinks}
            socialLinks={socialLinks}
            scrollTransition={scrollTransition}
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {enableSidebar ? (
            <MobileTopBar
              siteName={siteName}
              logoUrl={settings?.logoUrl}
              navLinks={navLinks}
              headerCta={headerCta}
              scrollTransition={scrollTransition}
              sticky={headerSticky}
            />
          ) : (
            <HeaderEditWrapper
              siteName={siteName}
              logoUrl={settings?.logoUrl}
              navLinks={navLinks}
              headerCtaLabel={settings?.headerCtaLabel}
              headerCtaHref={settings?.headerCtaHref}
              homeSections={homeSections}
            >
              <SiteHeader
                siteName={siteName}
                logoUrl={settings?.logoUrl}
                navLinks={navLinks}
                headerCta={headerCta}
                scrollTransition={scrollTransition}
                sticky={headerSticky}
              />
            </HeaderEditWrapper>
          )}

          <main id="main-content" className="flex-1">
            {children}
          </main>
          <FooterEditWrapper
            tagline={settings?.tagline}
            businessInfo={settings?.businessInfo}
            footerColumns={settings?.footerColumns ?? []}
            socialLinks={socialLinks}
          >
            <SiteFooter settings={settings} />
          </FooterEditWrapper>
        </div>

        {enableSidebar && sidebarPos === "right" && (
          <SiteSidebar
            siteName={siteName}
            logoUrl={settings?.logoUrl}
            navLinks={navLinks}
            socialLinks={socialLinks}
            scrollTransition={scrollTransition}
          />
        )}
      </SiteStyleWrapper>

      <EditModeToggle />
      <StyleSidebar />
    </EditModeProvider>
  );
}
