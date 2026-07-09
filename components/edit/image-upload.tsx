"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { MediaLibraryDialog } from "@/components/edit/media-library-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImage } from "@/lib/uploads/upload-image";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  allowManualUrl?: boolean;
}

export function ImageUpload({ value, onChange, allowManualUrl }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState("");

  const onDrop = useCallback(
    async ([file]: File[]) => {
      if (!file) {
        return;
      }

      setIsUploading(true);
      try {
        const url = await uploadImage(file);
        onChange(url);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed.");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "image/gif": [],
      "image/avif": [],
    },
    maxFiles: 1,
    multiple: false,
    disabled: isUploading,
  });

  const handleManualUrlSubmit = () => {
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setManualUrl("");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {value && (
        <div className="relative aspect-video w-full overflow-hidden rounded-md border">
          <Image src={value} alt="" fill sizes="100vw" className="object-cover" />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2"
            aria-label="Remove image"
            onClick={() => onChange("")}
          >
            <X />
          </Button>
        </div>
      )}
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground transition-colors",
          isDragActive && "border-primary bg-primary/5",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        <input {...getInputProps()} />
        <p>
          {isUploading
            ? "Uploading..."
            : isDragActive
              ? "Drop image here"
              : value
                ? "Drag & drop to replace, or click to browse"
                : "Drag & drop an image, or click to browse"}
        </p>
        <p className="mt-1 text-xs">Max 10MB. JPEG, PNG, WebP, GIF, or AVIF.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <MediaLibraryDialog onSelect={onChange} />
        {allowManualUrl && (
          <div className="flex flex-1 gap-2">
            <Input
              placeholder="Or paste an image URL"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleManualUrlSubmit();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={handleManualUrlSubmit}>
              Use URL
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
