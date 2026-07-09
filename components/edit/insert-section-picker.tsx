"use client";

import { Plus } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { addSection } from "@/lib/sections/actions";
import { sectionTypeOptions } from "@/lib/sections/registry";
import type { SectionType } from "@/lib/sections/types";

interface InsertSectionPickerProps {
  pageId: string;
  afterSectionId: string | null;
  isFileDropTarget?: boolean;
  onFileDrop?: (file: File) => void;
}

export function InsertSectionPicker({
  pageId,
  afterSectionId,
  isFileDropTarget,
  onFileDrop,
}: InsertSectionPickerProps) {
  const [isPending, startTransition] = useTransition();

  const handleAdd = (type: SectionType) => {
    startTransition(async () => {
      const result = await addSection(pageId, type, afterSectionId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Section added.");
      }
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && onFileDrop) {
      onFileDrop(file);
    }
  };

  return (
    <div
      data-edit-toolbar
      className={cn(
        "group/insert relative flex items-center justify-center transition-all",
        isFileDropTarget ? "py-4" : "py-0.5",
      )}
      onDragOver={isFileDropTarget ? (e) => e.preventDefault() : undefined}
      onDrop={isFileDropTarget ? handleDrop : undefined}
    >
      {/* Horizontal divider line */}
      <div
        className={cn(
          "absolute inset-x-4 top-1/2 -translate-y-1/2 border-t transition-colors",
          isFileDropTarget
            ? "border-primary border-dashed border-t-2"
            : "border-border/0 border-dashed group-hover/insert:border-border/60",
        )}
      />

      {isFileDropTarget ? (
        <span className="relative z-10 rounded bg-background px-3 py-1 text-xs font-medium text-primary">
          Drop image here
        </span>
      ) : (
        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Insert section here"
                disabled={isPending}
                className="relative z-10 -translate-y-1 rounded-full bg-background opacity-0 shadow-md transition-all duration-200 group-hover/insert:translate-y-0 group-hover/insert:opacity-100"
              />
            }
          >
            <Plus />
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="flex flex-col gap-1">
              {sectionTypeOptions.map((option) => (
                <Button
                  key={option.type}
                  type="button"
                  variant="ghost"
                  className="justify-start"
                  disabled={isPending}
                  onClick={() => handleAdd(option.type)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
