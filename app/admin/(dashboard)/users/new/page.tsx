import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { UserForm } from "../user-form";

export default async function NewUserPage() {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    redirect("/admin");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New user</h1>
      </div>
      <UserForm user={null} />
    </div>
  );
}
