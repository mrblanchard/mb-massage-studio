import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/require-auth";
import { R2_BUCKET_NAME, R2_PUBLIC_URL, r2Client } from "@/lib/r2/client";

const ALLOWED_CONTENT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  await requireAuth();

  if (!R2_BUCKET_NAME || !R2_PUBLIC_URL) {
    return NextResponse.json(
      { error: "Media storage isn't configured yet. Add R2 credentials to .env (see TEMPLATE-SETUP.md)." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const contentType = typeof body?.contentType === "string" ? body.contentType : "";
  const size = typeof body?.size === "number" ? body.size : 0;

  const extension = ALLOWED_CONTENT_TYPES[contentType];
  if (!extension) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  if (size <= 0 || size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File is too large." }, { status: 400 });
  }

  const key = `uploads/${crypto.randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ContentLength: size,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });

  return NextResponse.json({
    uploadUrl,
    publicUrl: `${R2_PUBLIC_URL}/${key}`,
    key,
  });
}
