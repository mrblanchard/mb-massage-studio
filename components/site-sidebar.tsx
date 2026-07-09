import { Link2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { NavLinks, type ScrollTransition } from "@/components/nav-links";

interface SiteSidebarProps {
  siteName: string;
  logoUrl?: string | null;
  navLinks: { label: string; href: string }[];
  socialLinks?: Record<string, string>;
  scrollTransition?: ScrollTransition;
}

export function SiteSidebar({
  siteName,
  logoUrl,
  navLinks,
  socialLinks,
  scrollTransition,
}: SiteSidebarProps) {
  const socialEntries = Object.entries(socialLinks ?? {});

  return (
    <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:border-r">
      <div className="sticky top-0 flex h-screen flex-col gap-6 overflow-y-auto p-4">
        {/* Logo / site name */}
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          {logoUrl ? (
            <Image
              src={logoUrl}
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

        {/* Nav links */}
        {navLinks.length > 0 && (
          <nav aria-label="Sidebar navigation">
            <NavLinks links={navLinks} vertical scrollTransition={scrollTransition} />
          </nav>
        )}

        {/* Social links */}
        {socialEntries.length > 0 && (
          <div className="mt-auto">
            <ul className="flex flex-col gap-1.5">
              {socialEntries.map(([platform, url]) => (
                <li key={platform}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platform.charAt(0).toUpperCase() + platform.slice(1)}
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
    </aside>
  );
}
