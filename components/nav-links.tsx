"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";

import { cn } from "@/lib/utils";

export type ScrollTransition = "off" | "slow" | "semiSlow" | "medium" | "fast";

const SCROLL_DURATIONS: Record<ScrollTransition, number> = {
  off: 0,
  slow: 1400,
  semiSlow: 1000,
  medium: 650,
  fast: 300,
};

// Rough sticky-header height so the target section isn't hidden underneath it.
const HEADER_OFFSET = 90;

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function smoothScrollTo(targetY: number, duration: number) {
  const startY = window.scrollY;
  const diff = targetY - startY;

  if (duration <= 0) {
    window.scrollTo(0, targetY);
    return;
  }

  let startTime: number | null = null;
  function step(timestamp: number) {
    if (startTime === null) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + diff * easeInOutQuad(progress));
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

interface NavLinksProps {
  links: { label: string; href: string }[];
  className?: string;
  onNavigate?: () => void;
  vertical?: boolean;
  scrollTransition?: ScrollTransition;
}

export function NavLinks({
  links,
  className,
  onNavigate,
  vertical,
  scrollTransition = "medium",
}: NavLinksProps) {
  const pathname = usePathname();

  const handleClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.();

    const isAnchor = href.startsWith("/#") || href.startsWith("#");
    if (!isAnchor || scrollTransition === "off") return;

    // Only intercept same-page anchors we can scroll to immediately; anchors
    // to a different route fall back to normal navigation.
    if (href.startsWith("/#") && pathname !== "/") return;

    const id = href.split("#")[1];
    const target = id ? document.getElementById(id) : null;
    if (!target) return;

    event.preventDefault();
    const targetY = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    smoothScrollTo(targetY, SCROLL_DURATIONS[scrollTransition]);
  };

  return (
    <ul className={cn("flex gap-6 text-sm", vertical && "flex-col gap-1", className)}>
      {links.map((link) => {
        const isAnchor = link.href.startsWith("/#") || link.href.startsWith("#");
        const isActive = isAnchor
          ? false
          : link.href === "/"
            ? pathname === "/"
            : pathname === link.href || pathname.startsWith(link.href + "/");

        return (
          <li key={link.label + link.href}>
            <Link
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "transition-colors hover:text-foreground",
                isActive ? "font-medium text-foreground" : "text-muted-foreground",
                vertical && "block rounded px-2 py-1.5 hover:bg-accent",
              )}
              onClick={handleClick(link.href)}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
