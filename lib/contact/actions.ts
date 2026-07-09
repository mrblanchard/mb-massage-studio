"use server";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/db/queries/site-settings";
import { contactSubmissions, sections } from "@/lib/db/schema";
import { getResendClient } from "@/lib/email/resend";
import { buildContactZodSchema } from "./dynamic-schema";

export async function submitContactForm(sectionId: string, values: Record<string, string>) {
  const section = await db.query.sections.findFirst({ where: eq(sections.id, sectionId) });
  if (!section || section.type !== "contact") {
    return { error: "This form is no longer available." };
  }

  const content = section.content as {
    fields: { id: string; label: string; type: string; required: boolean }[];
    notifyEmail?: string;
  };
  const fields = content.fields ?? [];

  const schema = buildContactZodSchema(fields as never);
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    return { error: "Please check the form and try again." };
  }

  const data = parsed.data as Record<string, string>;

  // Honeypot: bots that fill in the hidden field get a fake success.
  if (data.company) {
    return { success: true };
  }

  const nameField = fields.find((f) => f.type === "text");
  const emailField = fields.find((f) => f.type === "email");
  const messageField = fields.find((f) => f.type === "textarea");
  const phoneField = fields.find((f) => f.type === "tel");

  const name = nameField ? data[nameField.id] : undefined;
  const email = emailField ? data[emailField.id] : undefined;
  const message = messageField ? data[messageField.id] : undefined;
  const phone = phoneField ? data[phoneField.id] : undefined;

  const submissionData: Record<string, string> = {};
  for (const field of fields) {
    if (data[field.id]) submissionData[field.label] = data[field.id];
  }

  await db.insert(contactSubmissions).values({
    name: name || null,
    email: email || null,
    phone: phone || null,
    message: message || null,
    data: submissionData,
  });

  const settings = await getSiteSettings();
  const to = content.notifyEmail || settings?.contactEmail || process.env.CONTACT_EMAIL_TO;
  const resend = getResendClient();

  if (resend && to) {
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Website <onboarding@resend.dev>",
        to,
        replyTo: email,
        subject: `New contact form submission${name ? ` from ${name}` : ""}`,
        text: Object.entries(submissionData)
          .map(([label, value]) => `${label}: ${value}`)
          .join("\n"),
      });
    } catch (error) {
      console.error("Failed to send contact form notification email", error);
    }
  }

  return { success: true };
}
