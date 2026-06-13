import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getUserById } from "@/lib/db/queries/users";

import { UserForm } from "../user-form";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    redirect("/admin");
  }

  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit user</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>
      <UserForm user={user} />
    </div>
  );
}
