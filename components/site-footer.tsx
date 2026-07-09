import { Link2 } from "lucide-react";
import Link from "next/link";

import { Prose } from "@/components/ui/prose";
import type { SiteSettings } from "@/lib/db/queries/site-settings";

export function SiteFooter({ settings }: { settings: SiteSettings | null }) {
  const siteName = settings?.siteName || "Your Business";
  const businessInfo = settings?.businessInfo;
  const socialLinks = settings?.socialLinks ?? {};
  const footerColumns = settings?.footerColumns ?? [];

  const hasBusinessInfo =
    businessInfo?.address ||
    businessInfo?.phone ||
    businessInfo?.email ||
    businessInfo?.hours;
  const hasSocialLinks = Object.keys(socialLinks).length > 0;
  const hasContent =
    hasBusinessInfo || footerColumns.length > 0 || hasSocialLinks || settings?.tagline;

  return (
    <footer className="border-t">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {hasContent && (
          <div className="flex flex-wrap justify-between gap-8 pb-8">
            <div className="flex min-w-48 flex-col gap-1">
              <p className="font-heading font-semibold" style={{ fontWeight: "var(--font-heading-weight, 700)" }}>
                {siteName}
              </p>
              {settings?.tagline && (
                <p className="text-sm text-muted-foreground">{settings.tagline}</p>
              )}
            </div>
            {hasBusinessInfo && (
              <div className="flex min-w-48 flex-col gap-1 text-sm text-muted-foreground">
                {businessInfo?.address && <p>{businessInfo.address}</p>}
                {businessInfo?.phone && <p>{businessInfo.phone}</p>}
                {businessInfo?.email && (
                  <a
                    href={`mailto:${businessInfo.email}`}
                    className="hover:text-foreground"
                  >
                    {businessInfo.email}
                  </a>
                )}
                {businessInfo?.hours && <p>{businessInfo.hours}</p>}
              </div>
            )}
            {footerColumns.map((col, i) => (
              <div key={i} className="flex min-w-36 flex-col gap-2">
                {col.heading && (
                  <h3 className="text-sm font-semibold">{col.heading}</h3>
                )}
                {col.body && (
                  <Prose
                    html={col.body}
                    className="text-sm text-muted-foreground [&_p]:leading-relaxed"
                  />
                )}
                {col.links.length > 0 && (
                  <ul className="flex flex-col gap-1.5">
                    {col.links.map((link, j) => (
                      <li key={j}>
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {hasSocialLinks && (
              <div className="flex min-w-36 flex-col gap-2">
                <h3 className="text-sm font-semibold">Follow Us</h3>
                <ul className="flex flex-col gap-1.5">
                  {Object.entries(socialLinks).map(([platform, url]) => (
                    <li key={platform}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Link2 className="size-3.5 shrink-0" aria-hidden="true" />
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
