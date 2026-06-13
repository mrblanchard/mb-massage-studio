"use client";

import { Plus } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addSection } from "@/lib/sections/actions";
import { sectionTypeOptions } from "@/lib/sections/registry";
import type { SectionType } from "@/lib/sections/types";

export function AddSectionPicker({ pageId }: { pageId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleAdd = (type: SectionType) => {
    startTransition(async () => {
      const result = await addSection(pageId, type);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Section added.");
      }
    });
  };

  return (
    <div className="mx-auto my-8 flex max-w-5xl justify-center px-4">
      <Popover>
        <PopoverTrigger
          render={
            <Button type="button" variant="outline" disabled={isPending}>
              <Plus /> Add section
            </Button>
          }
        />
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
    </div>
  );
}
