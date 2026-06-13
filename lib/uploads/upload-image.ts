import { recordMedia } from "@/app/admin/(dashboard)/media/actions";

function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  });
}

export async function uploadImage(file: File): Promise<string> {
  const presignRes = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, size: file.size }),
  });

  if (!presignRes.ok) {
    const data = (await presignRes.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Failed to get upload URL.");
  }

  const { uploadUrl, publicUrl, key } = (await presignRes.json()) as {
    uploadUrl: string;
    publicUrl: string;
    key: string;
  };

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload image.");
  }

  const dimensions = await getImageDimensions(file);

  await recordMedia({
    key,
    url: publicUrl,
    filename: file.name,
    contentType: file.type,
    size: file.size,
    width: dimensions?.width,
    height: dimensions?.height,
  });

  return publicUrl;
}
