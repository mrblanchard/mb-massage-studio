"use client";

import { useEffect, useState } from "react";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

interface ColorFieldProps {
  value: string | undefined;
  onChange: (value: string) => void;
  ariaLabel: string;
}

export function ColorField({ value, onChange, ariaLabel }: ColorFieldProps) {
  const [hexText, setHexText] = useState(value ?? "");

  useEffect(() => {
    setHexText(value ?? "");
  }, [value]);

  const handleHexChange = (next: string) => {
    setHexText(next);
    if (HEX_PATTERN.test(next)) {
      onChange(next);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        size="sm"
        aria-label={ariaLabel}
        checked={!!value}
        onCheckedChange={(checked) => onChange(checked ? "#000000" : "")}
      />
      {value ? (
        <>
          <div
            className="relative size-7 shrink-0 overflow-hidden rounded-md ring-1 ring-border"
            style={{ backgroundColor: HEX_PATTERN.test(value) ? value : "#000000" }}
          >
            <input
              type="color"
              aria-label={`${ariaLabel} (picker)`}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
              value={HEX_PATTERN.test(value) ? value : "#000000"}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
          <input
            type="text"
            aria-label={`${ariaLabel} (hex)`}
            className={cn(
              "h-7 w-20 rounded-md border border-input bg-transparent px-2 font-mono text-xs outline-none transition-colors",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
            placeholder="#000000"
            value={hexText}
            onChange={(e) => handleHexChange(e.target.value)}
          />
        </>
      ) : (
        <span className="text-xs text-muted-foreground">Default</span>
      )}
    </div>
  );
}
