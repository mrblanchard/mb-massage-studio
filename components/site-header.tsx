"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { NavLinks, type ScrollTransition } from "@/components/nav-links";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  siteName: string;
  logoUrl?: string | null;
  navLinks: { label: string; href: string }[];
  headerCta?: { label: string; href: string } | null;
  scrollTransition?: ScrollTransition;
  sticky?: boolean;
}

export function SiteHeader({
  siteName,
  logoUrl,
  navLinks,
  headerCta,
  scrollTransition,
  sticky = true,
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className={cn("border-b bg-background", sticky && "sticky top-0 z-40")}>
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        {logoUrl && (
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <Image
              src={logoUrl}
              alt={siteName}
              width={160}
              height={40}
              unoptimized
              className="h-9 w-auto object-contain"
            />
          </Link>
        )}

        {/* Desktop nav */}
        {navLinks.length > 0 && (
          <nav className="hidden md:block" aria-label="Main navigation">
            <NavLinks links={navLinks} scrollTransition={scrollTransition} />
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          {headerCta && (
            <Button
              render={<Link href={headerCta.href}>{headerCta.label}</Link>}
              nativeButton={false}
              className="rounded-full"
            />
          )}

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation"
                  className="md:hidden"
                >
                  <Menu />
                </Button>
              }
            />
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>
                  <Link
                    href="/"
                    className="text-lg font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    {siteName}
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="px-4 pb-4" aria-label="Mobile navigation">
                <NavLinks
                  links={navLinks}
                  vertical
                  onNavigate={() => setOpen(false)}
                  scrollTransition={scrollTransition}
                />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
