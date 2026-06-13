import { desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";

export type ContactSubmission = typeof contactSubmissions.$inferSelect;

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  return db.query.contactSubmissions.findMany({
    orderBy: [desc(contactSubmissions.createdAt)],
  });
}
