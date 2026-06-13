"use client";

import { Copy, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { deleteMedia, updateMedia } from "./actions";

export interface MediaGridItem {
  id: string;
  url: string;
  filename: string | null;
  alt: string | null;
  contentType: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
  createdAt: string;
}

function formatBytes(bytes: number | null) {
  if (!bytes) {
    return "";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatType(contentType: string | null) {
  return contentType ? contentType.replace("image/", "").toUpperCase() : "";
}

const sortItems = {
  newest: "Newest first",
  oldest: "Oldest first",
  name: "Name (A-Z)",
  largest: "Largest first",
  smallest: "Smallest first",
};

export function MediaGrid({ items }: { items: MediaGridItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [editingItem, setEditingItem] = useState<MediaGridItem | null>(null);
  const [filenameInput, setFilenameInput] = useState("");
  const [altInput, setAltInput] = useState("");

  const typeItems = useMemo(() => {
    const map: Record<string, string> = { all: "All types" };
    for (const item of items) {
      if (item.contentType && !map[item.contentType]) {
        map[item.contentType] = formatType(item.contentType);
      }
    }
    return map;
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = items;
    if (query) {
      result = result.filter(
        (item) =>
          (item.filename ?? "").toLowerCase().includes(query) ||
          (item.alt ?? "").toLowerCase().includes(query)
      );
    }
    if (typeFilter !== "all") {
      result = result.filter((item) => item.contentType === typeFilter);
    }

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name":
          return (a.filename ?? "").localeCompare(b.filename ?? "");
        case "largest":
          return (b.size ?? 0) - (a.size ?? 0);
        case "smallest":
          return (a.size ?? 0) - (b.size ?? 0);
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [items, search, typeFilter, sortBy]);

  if (items.length === 0) {
    return <p className="text-muted-foreground">No uploads yet.</p>;
  }

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success("URL copied.");
  };

  const handleDelete = (id: string, filename: string | null) => {
    if (!window.confirm(`Delete "${filename ?? "this image"}"? This cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteMedia(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Image deleted.");
      }
    });
  };

  const handleEditOpen = (item: MediaGridItem) => {
    setEditingItem(item);
    setFilenameInput(item.filename ?? "");
    setAltInput(item.alt ?? "");
  };

  const handleEditSave = () => {
    if (!editingItem) {
      return;
    }
    startTransition(async () => {
      const result = await updateMedia(editingItem.id, {
        filename: filenameInput,
        alt: altInput,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Image updated.");
        setEditingItem(null);
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search by filename or alt text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select items={typeItems} value={typeFilter} onValueChange={(value) => setTypeFilter(value ?? "all")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(typeItems).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select items={sortItems} value={sortBy} onValueChange={(value) => setSortBy(value ?? "newest")}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(sortItems).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-muted-foreground">No images match your search.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredItems.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 rounded-md border p-2">
              <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
                <Image
                  src={item.url}
                  alt={item.alt ?? item.filename ?? ""}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                <span className="truncate font-medium text-foreground">
                  {item.filename ?? "Untitled"}
                </span>
                <span>
                  {[
                    formatType(item.contentType),
                    item.width && item.height ? `${item.width}×${item.height}` : null,
                    formatBytes(item.size),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  aria-label="Edit details"
                  onClick={() => handleEditOpen(item)}
                >
                  <Pencil />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  aria-label="Copy URL"
                  onClick={() => handleCopy(item.url)}
                >
                  <Copy />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  aria-label="Delete"
                  disabled={isPending}
                  onClick={() => handleDelete(item.id, item.filename)}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit image details</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
              <Image src={editingItem.url} alt="" fill className="object-cover" />
            </div>
          )}
          <Field>
            <FieldLabel htmlFor="media-filename">Filename</FieldLabel>
            <Input
              id="media-filename"
              value={filenameInput}
              onChange={(e) => setFilenameInput(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="media-alt">Alt text</FieldLabel>
            <Input id="media-alt" value={altInput} onChange={(e) => setAltInput(e.target.value)} />
            <FieldDescription>Describes the image for screen readers and SEO.</FieldDescription>
          </Field>
          <DialogFooter>
            <Button type="button" disabled={isPending} onClick={handleEditSave}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
