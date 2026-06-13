"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { getAllMedia } from "@/lib/db/queries/media";
import { media } from "@/lib/db/schema";
import { R2_BUCKET_NAME, r2Client } from "@/lib/r2/client";

export interface MediaItem {
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

export async function getMediaList(): Promise<MediaItem[]> {
  await requireAuth();

  const items = await getAllMedia();

  return items.map((item) => ({
    id: item.id,
    url: item.url,
    filename: item.filename,
    alt: item.alt,
    contentType: item.contentType,
    size: item.size,
    width: item.width,
    height: item.height,
    createdAt: item.createdAt.toISOString(),
  }));
}

export async function recordMedia(input: {
  key: string;
  url: string;
  filename?: string;
  contentType?: string;
  size?: number;
  width?: number;
  height?: number;
}) {
  await requireAuth();

  const [item] = await db
    .insert(media)
    .values({
      key: input.key,
      url: input.url,
      filename: input.filename || null,
      contentType: input.contentType || null,
      size: input.size || null,
      width: input.width || null,
      height: input.height || null,
    })
    .returning();

  revalidatePath("/admin/media");

  return { success: true, id: item.id };
}

export async function updateMedia(id: string, input: { filename?: string; alt?: string }) {
  await requireAuth();

  const item = await db.query.media.findFirst({ where: eq(media.id, id) });
  if (!item) {
    return { error: "Media item not found." };
  }

  await db
    .update(media)
    .set({
      filename: input.filename?.trim() || null,
      alt: input.alt?.trim() || null,
    })
    .where(eq(media.id, id));

  revalidatePath("/admin/media");

  return { success: true };
}

export async function deleteMedia(id: string) {
  await requireAuth();

  const item = await db.query.media.findFirst({ where: eq(media.id, id) });
  if (!item) {
    return { error: "Media item not found." };
  }

  await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: item.key }));

  await db.delete(media).where(eq(media.id, id));

  revalidatePath("/admin/media");

  return { success: true };
}
