"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { userFormSchema, type UserFormValues } from "@/lib/users/schema";

export async function createUser(values: UserFormValues) {
  await requireOwner();

  const parsed = userFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid form data." };
  }

  const data = parsed.data;

  if (!data.password) {
    return { error: "A password is required for new accounts." };
  }

  const existing = await db.query.users.findFirst({ where: eq(users.email, data.email) });
  if (existing) {
    return { error: "A user with this email already exists." };
  }

  const passwordHash = await hash(data.password, 12);

  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      name: data.name || null,
      role: data.role,
      passwordHash,
    })
    .returning();

  revalidatePath("/admin/users");

  return { success: true, id: user.id };
}

export async function updateUser(id: string, values: UserFormValues) {
  await requireOwner();

  const parsed = userFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid form data." };
  }

  const data = parsed.data;

  const current = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!current) {
    return { error: "User not found." };
  }

  const existing = await db.query.users.findFirst({ where: eq(users.email, data.email) });
  if (existing && existing.id !== id) {
    return { error: "A user with this email already exists." };
  }

  if (current.role === "owner" && data.role !== "owner") {
    const owners = await db.query.users.findMany({ where: eq(users.role, "owner") });
    if (owners.length <= 1) {
      return { error: "At least one owner account is required." };
    }
  }

  await db
    .update(users)
    .set({
      email: data.email,
      name: data.name || null,
      role: data.role,
      ...(data.password ? { passwordHash: await hash(data.password, 12) } : {}),
    })
    .where(eq(users.id, id));

  revalidatePath("/admin/users");

  return { success: true };
}

export async function deleteUser(id: string) {
  const session = await requireOwner();

  if (session.user.id === id) {
    return { error: "You cannot delete your own account." };
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) {
    return { error: "User not found." };
  }

  if (user.role === "owner") {
    const owners = await db.query.users.findMany({ where: eq(users.role, "owner") });
    if (owners.length <= 1) {
      return { error: "At least one owner account is required." };
    }
  }

  await db.delete(users).where(eq(users.id, id));

  revalidatePath("/admin/users");

  return { success: true };
}
