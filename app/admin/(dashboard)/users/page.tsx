import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { getAllUsers } from "@/lib/db/queries/users";

import { UserList } from "./user-list";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user.role !== "owner") {
    redirect("/admin");
  }

  const users = await getAllUsers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage admin accounts.</p>
        </div>
        <Button
          render={<Link href="/admin/users/new">New user</Link>}
          nativeButton={false}
        />
      </div>
      <UserList
        users={users.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt.toLocaleDateString(),
        }))}
        currentUserId={session.user.id}
      />
    </div>
  );
}
