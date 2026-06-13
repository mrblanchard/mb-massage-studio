"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";

export async function setSubmissionRead(id: string, read: boolean) {
  await requireAuth();

  const submission = await db.query.contactSubmissions.findFirst({ where: eq(contactSubmissions.id, id) });
  if (!submission) {
    return { error: "Message not found." };
  }

  await db.update(contactSubmissions).set({ read }).where(eq(contactSubmissions.id, id));

  revalidatePath("/admin/inbox");

  return { success: true };
}

export async function deleteSubmission(id: string) {
  await requireAuth();

  const submission = await db.query.contactSubmissions.findFirst({ where: eq(contactSubmissions.id, id) });
  if (!submission) {
    return { error: "Message not found." };
  }

  await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));

  revalidatePath("/admin/inbox");

  return { success: true };
}
