"use server";

import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/db/queries/site-settings";
import { contactSubmissions } from "@/lib/db/schema";
import { getResendClient } from "@/lib/email/resend";

import { contactFormSchema, type ContactFormValues } from "./schema";

export async function submitContactForm(values: ContactFormValues) {
  const parsed = contactFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Please check the form and try again." };
  }

  const { name, email, phone, message, company } = parsed.data;

  // Honeypot: bots that fill in the hidden field get a fake success.
  if (company) {
    return { success: true };
  }

  await db.insert(contactSubmissions).values({
    name,
    email,
    phone: phone || null,
    message,
  });

  const settings = await getSiteSettings();
  const to = settings?.contactEmail || process.env.CONTACT_EMAIL_TO;
  const resend = getResendClient();

  if (resend && to) {
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Website <onboarding@resend.dev>",
        to,
        replyTo: email,
        subject: `New contact form submission from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "—"}\n\n${message}`,
      });
    } catch (error) {
      console.error("Failed to send contact form notification email", error);
    }
  }

  return { success: true };
}
