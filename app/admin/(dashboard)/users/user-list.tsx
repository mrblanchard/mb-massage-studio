"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { deleteUser } from "./actions";

interface UserListItem {
  id: string;
  email: string;
  name: string | null;
  role: "owner" | "editor";
  createdAt: string;
}

export function UserList({ users, currentUserId }: { users: UserListItem[]; currentUserId: string }) {
  const [isPending, startTransition] = useTransition();

  if (users.length === 0) {
    return <p className="text-muted-foreground">No users yet.</p>;
  }

  const handleDelete = (id: string, email: string) => {
    if (!window.confirm(`Delete "${email}"? This cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteUser(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("User deleted.");
      }
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.email}</TableCell>
            <TableCell>{user.name ?? "—"}</TableCell>
            <TableCell>
              <Badge variant={user.role === "owner" ? "default" : "outline"}>{user.role}</Badge>
            </TableCell>
            <TableCell>{user.createdAt}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link href={`/admin/users/${user.id}`}>Edit</Link>}
                  nativeButton={false}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isPending || user.id === currentUserId}
                  onClick={() => handleDelete(user.id, user.email)}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
