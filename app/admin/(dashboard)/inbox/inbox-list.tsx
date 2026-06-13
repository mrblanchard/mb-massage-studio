"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { deleteSubmission, setSubmissionRead } from "./actions";

interface SubmissionItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export function InboxList({ submissions }: { submissions: SubmissionItem[] }) {
  const [isPending, startTransition] = useTransition();

  if (submissions.length === 0) {
    return <p className="text-muted-foreground">No messages yet.</p>;
  }

  const handleToggleRead = (id: string, read: boolean) => {
    startTransition(async () => {
      const result = await setSubmissionRead(id, read);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this message? This cannot be undone.")) {
      return;
    }
    startTransition(async () => {
      const result = await deleteSubmission(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Message deleted.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {submissions.map((submission) => (
        <Card key={submission.id}>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{submission.name}</span>
                {!submission.read && <Badge>New</Badge>}
              </div>
              <div className="text-sm text-muted-foreground">
                <a href={`mailto:${submission.email}`} className="hover:underline">
                  {submission.email}
                </a>
                {submission.phone && <span> · {submission.phone}</span>}
              </div>
              <div className="text-xs text-muted-foreground">{submission.createdAt}</div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleToggleRead(submission.id, !submission.read)}
              >
                {submission.read ? "Mark unread" : "Mark read"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isPending}
                onClick={() => handleDelete(submission.id)}
              >
                Delete
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm">{submission.message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
