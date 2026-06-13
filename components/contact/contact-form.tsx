"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContactForm } from "@/lib/contact/actions";
import { contactFormDefaultValues, contactFormSchema, type ContactFormValues } from "@/lib/contact/schema";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const { control, handleSubmit, reset } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: contactFormDefaultValues,
  });

  const onSubmit = (values: ContactFormValues) => {
    startTransition(async () => {
      const result = await submitContactForm(values);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Thanks! We'll be in touch soon.");
        reset(contactFormDefaultValues);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mx-auto mt-8 flex max-w-md flex-col gap-4 text-left"
    >
      <FieldGroup>
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="contact-name">Name</FieldLabel>
              <Input id="contact-name" aria-invalid={fieldState.invalid} {...field} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="contact-email">Email</FieldLabel>
              <Input id="contact-email" type="email" aria-invalid={fieldState.invalid} {...field} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="contact-phone">Phone (optional)</FieldLabel>
              <Input id="contact-phone" type="tel" aria-invalid={fieldState.invalid} {...field} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="message"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="contact-message">Message</FieldLabel>
              <Textarea id="contact-message" rows={5} aria-invalid={fieldState.invalid} {...field} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="company"
          render={({ field }) => (
            <input
              {...field}
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-px w-px overflow-hidden"
            />
          )}
        />
      </FieldGroup>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
