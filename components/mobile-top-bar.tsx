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

interface MobileTopBarProps {
  siteName: string;
  logoUrl?: string | null;
  navLinks: { label: string; href: string }[];
  headerCta?: { label: string; href: string } | null;
  scrollTransition?: ScrollTransition;
  sticky?: boolean;
}

export function MobileTopBar({
  siteName,
  logoUrl,
  navLinks,
  headerCta,
  scrollTransition,
  sticky = true,
}: MobileTopBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b bg-background px-4 py-3 md:hidden",
        sticky && "sticky top-0 z-40",
      )}
    >
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={siteName}
            width={320}
            height={80}
            unoptimized
            className="h-18 w-auto object-contain"
          />
        ) : (
          siteName
        )}
      </Link>

      <div className="flex items-center gap-2">
        {headerCta && (
          <Button
            render={<Link href={headerCta.href}>{headerCta.label}</Link>}
            nativeButton={false}
            size="sm"
            className="rounded-full"
          />
        )}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Open navigation">
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
  );
}
