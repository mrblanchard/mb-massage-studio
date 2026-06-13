"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { getMediaList, type MediaItem } from "@/app/admin/(dashboard)/media/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function MediaLibraryDialog({ onSelect }: { onSelect: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);

    if (next && items === null) {
      setIsLoading(true);
      getMediaList()
        .then(setItems)
        .catch(() => {
          toast.error("Failed to load media library.");
          setItems([]);
        })
        .finally(() => setIsLoading(false));
    }
  };

  return (
    <>
      <Button type="button" variant="outline" onClick={() => handleOpenChange(true)}>
        Browse library
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Media library</DialogTitle>
          </DialogHeader>
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {items?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No uploads yet. Upload an image first to select it here.
            </p>
          )}
          {items && items.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="relative aspect-square overflow-hidden rounded-md border transition-opacity hover:opacity-80"
                  onClick={() => {
                    onSelect(item.url);
                    setOpen(false);
                  }}
                >
                  <Image src={item.url} alt={item.filename ?? ""} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
