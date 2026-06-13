import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your website content and settings.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Site Settings</CardTitle>
            <CardDescription>
              Update your business name, branding, navigation, and contact
              details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              render={<Link href="/admin/settings">Edit settings</Link>}
              nativeButton={false}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Homepage</CardTitle>
            <CardDescription>
              View your live homepage. Inline section editing is coming next.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              render={<Link href="/">View homepage</Link>}
              variant="outline"
              nativeButton={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
