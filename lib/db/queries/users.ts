import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export type User = typeof users.$inferSelect;

export async function getAllUsers() {
  return db.query.users.findMany({ orderBy: [asc(users.createdAt)] });
}

export async function getUserById(id: string): Promise<User | null> {
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  return user ?? null;
}
