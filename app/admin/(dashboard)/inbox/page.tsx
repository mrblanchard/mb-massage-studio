import { getContactSubmissions } from "@/lib/db/queries/contact-submissions";

import { InboxList } from "./inbox-list";

export default async function AdminInboxPage() {
  const submissions = await getContactSubmissions();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
        <p className="text-muted-foreground">Messages submitted through your contact form.</p>
      </div>
      <InboxList
        submissions={submissions.map((submission) => ({
          id: submission.id,
          name: submission.name,
          email: submission.email,
          phone: submission.phone,
          message: submission.message,
          read: submission.read,
          createdAt: submission.createdAt.toLocaleString(),
        }))}
      />
    </div>
  );
}
