import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

const baseNavItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/inbox", label: "Inbox" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/social", label: "Social" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/settings", label: "Settings" },
];

const ownerNavItems = [{ href: "/admin/users", label: "Users" }];

const accountNavItem = { href: "/admin/account", label: "Account" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const navItems = [
    ...baseNavItems,
    ...(session.user.role === "owner" ? ownerNavItems : []),
    accountNavItem,
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col gap-1 border-r p-4">
        <div className="mb-4 px-2 text-lg font-semibold">Admin</div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {item.label}
          </Link>
        ))}
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <Link
            href="/"
            className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View site
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <Button type="submit" variant="outline" className="w-full">
              Sign out
            </Button>
          </form>
        </div>
      </aside>
      <div className="flex-1">
        <div className="border-b px-6 py-3 text-sm text-muted-foreground">
          Signed in as {session.user.email} ({session.user.role})
        </div>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
