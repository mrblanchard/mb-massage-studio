"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";

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
      <input
        type="checkbox"
        aria-label={ariaLabel}
        checked={!!value}
        onChange={(e) => onChange(e.target.checked ? "#000000" : "")}
        className="size-4 shrink-0"
      />
      {value ? (
        <>
          <Input
            type="color"
            aria-label={`${ariaLabel} (picker)`}
            className="h-8 w-10 shrink-0 p-1"
            value={HEX_PATTERN.test(value) ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
          />
          <Input
            type="text"
            aria-label={`${ariaLabel} (hex)`}
            className="h-8 w-24 font-mono text-xs"
            placeholder="#000000"
            value={hexText}
            onChange={(e) => handleHexChange(e.target.value)}
          />
        </>
      ) : (
        <span className="text-sm text-muted-foreground">Default</span>
      )}
    </div>
  );
}
