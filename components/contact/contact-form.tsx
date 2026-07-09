"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildContactZodSchema } from "@/lib/contact/dynamic-schema";
import { submitContactForm } from "@/lib/contact/actions";
import type { ContactField } from "@/lib/sections/schemas/contact";

export function ContactForm({ sectionId, fields }: { sectionId: string; fields: ContactField[] }) {
  const [isPending, startTransition] = useTransition();
  const schema = buildContactZodSchema(fields);
  const defaultValues: Record<string, string> = { company: "" };
  for (const field of fields) defaultValues[field.id] = "";

  const { control, handleSubmit, reset } = useForm<Record<string, string>>({
    resolver: zodResolver(schema) as unknown as Resolver<Record<string, string>>,
    defaultValues,
  });

  const onSubmit = (values: Record<string, string>) => {
    startTransition(async () => {
      const result = await submitContactForm(sectionId, values);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Thanks! We'll be in touch soon.");
        reset(defaultValues);
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
        {fields.map((field) => (
          <Controller
            key={field.id}
            control={control}
            name={field.id}
            render={({ field: rhfField, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor={`contact-${field.id}`}>{field.label}</FieldLabel>
                {field.type === "textarea" ? (
                  <Textarea
                    id={`contact-${field.id}`}
                    rows={5}
                    aria-invalid={fieldState.invalid}
                    {...rhfField}
                  />
                ) : (
                  <Input
                    id={`contact-${field.id}`}
                    type={
                      field.type === "email"
                        ? "email"
                        : field.type === "tel"
                          ? "tel"
                          : field.type === "number"
                            ? "text"
                            : "text"
                    }
                    aria-invalid={fieldState.invalid}
                    {...rhfField}
                  />
                )}
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        ))}
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
