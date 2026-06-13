"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { uploadImage } from "@/lib/uploads/upload-image";
import { cn } from "@/lib/utils";

export function MediaUploader() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (files: File[]) => {
      if (files.length === 0) {
        return;
      }

      setIsUploading(true);
      try {
        for (const file of files) {
          await uploadImage(file);
        }
        toast.success(files.length > 1 ? "Images uploaded." : "Image uploaded.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed.");
      } finally {
        setIsUploading(false);
      }
    },
    [router]
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
    multiple: true,
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground transition-colors",
        isDragActive && "border-primary bg-primary/5",
        isUploading && "pointer-events-none opacity-60"
      )}
    >
      <input {...getInputProps()} />
      <p>
        {isUploading
          ? "Uploading..."
          : isDragActive
            ? "Drop images here"
            : "Drag & drop images, or click to browse"}
      </p>
    </div>
  );
}
