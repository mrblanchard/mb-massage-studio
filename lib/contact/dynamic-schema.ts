import { z } from "zod";

import type { ContactField } from "@/lib/sections/schemas/contact";

export function buildContactZodSchema(fields: ContactField[]) {
  const shape: Record<string, z.ZodTypeAny> = {
    // Honeypot: real visitors never fill this in. Hidden via CSS.
    company: z.string().optional(),
  };

  for (const field of fields) {
    let fieldSchema: z.ZodString;
    switch (field.type) {
      case "email":
        fieldSchema = z.string().email("Enter a valid email address");
        break;
      case "tel":
        fieldSchema = z.string().min(7, "Enter a valid phone number");
        break;
      case "number":
        fieldSchema = z.string().regex(/^\d+$/, "Numbers only");
        break;
      case "text":
      case "textarea":
      default:
        fieldSchema = z.string().min(1, `${field.label} is required`);
    }

    shape[field.id] = field.required
      ? fieldSchema
      : z.union([fieldSchema, z.literal("")]).optional();
  }

  return z.object(shape);
}

export type DynamicContactValues = Record<string, string>;
