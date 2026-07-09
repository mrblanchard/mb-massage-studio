"use client";

import { useEffect } from "react";

import { useEditMode } from "@/lib/edit/edit-mode-context";
import type { TypographyRole } from "@/lib/theme/typography-schema";

const MATCH_SELECTOR = 'h1,h2,h3,h4,h5,h6,p,small,[data-slot="button"],a';

function roleForElement(element: Element): TypographyRole {
  if (element.matches('[data-slot="button"]')) return "button";
  const tag = element.tagName.toLowerCase();
  switch (tag) {
    case "h1":
      return "h1";
    case "h2":
      return "h2";
    case "h3":
      return "h3";
    case "h4":
    case "h5":
    case "h6":
      return "h4";
    case "p":
      return "body";
    case "small":
      return "small";
    default:
      return "link";
  }
}

/**
 * No visual output — attaches a capture-phase click listener while Edit Mode
 * is on, so clicking any heading/paragraph/button/link on the public page
 * jumps to its style control instead of navigating/submitting.
 */
export function StyleClickRouter() {
  const { isEditMode, requestStyleScroll } = useEditMode();

  useEffect(() => {
    if (!isEditMode) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;

      const siteContent = target.closest(".site-content");
      if (!siteContent) return;

      // Don't hijack the section/header/footer toolbars or the insert-section
      // popover — those already have their own click handling.
      if (target.closest("[data-edit-toolbar]")) return;

      const match = target.closest(MATCH_SELECTOR);
      if (!match) return;

      event.preventDefault();
      event.stopPropagation();
      requestStyleScroll(roleForElement(match));
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isEditMode, requestStyleScroll]);

  return null;
}
