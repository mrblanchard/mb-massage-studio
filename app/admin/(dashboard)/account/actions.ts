"use server";

import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";

import { changePasswordSchema, type ChangePasswordValues } from "@/lib/account/schema";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function changePassword(values: ChangePasswordValues) {
  const session = await requireAuth();

  const parsed = changePasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data." };
  }

  const data = parsed.data;

  const user = await db.query.users.findFirst({ where: eq(users.id, session.user.id) });
  if (!user) {
    return { error: "User not found." };
  }

  const valid = await compare(data.currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "Current password is incorrect." };
  }

  const passwordHash = await hash(data.newPassword, 12);

  await db.update(users).set({ passwordHash }).where(eq(users.id, session.user.id));

  return { success: true };
}
