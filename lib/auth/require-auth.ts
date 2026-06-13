import { auth } from "@/auth";

/**
 * Verifies the caller has an active session. Server Actions and route
 * handlers must call this directly rather than relying on proxy.ts alone.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireOwner() {
  const session = await requireAuth();
  if (session.user.role !== "owner") {
    throw new Error("Forbidden");
  }
  return session;
}
