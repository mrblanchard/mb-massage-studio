import { getAllMedia } from "@/lib/db/queries/media";

import { MediaGrid } from "./media-grid";
import { MediaUploader } from "./media-uploader";

export default async function MediaPage() {
  const items = await getAllMedia();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Media</h1>
        <p className="text-muted-foreground">
          Upload and manage images used across your site.
        </p>
      </div>
      <MediaUploader />
      <MediaGrid
        items={items.map((item) => ({
          id: item.id,
          url: item.url,
          filename: item.filename,
          alt: item.alt,
          contentType: item.contentType,
          size: item.size,
          width: item.width,
          height: item.height,
          createdAt: item.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
