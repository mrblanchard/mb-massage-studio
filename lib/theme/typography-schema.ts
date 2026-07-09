import { z } from "zod";

import { fontOptions } from "@/lib/fonts";

export const typographyRoles = [
  "h1",
  "h2",
  "h3",
  "h4",
  "body",
  "small",
  "button",
  "link",
] as const;
export type TypographyRole = (typeof typographyRoles)[number];

const hexColorOrEmpty = z
  .union([z.string().regex(/^#[0-9a-fA-F]{3,8}$/, "Enter a valid hex color"), z.literal("")])
  .optional();

export const typographyRoleSchema = z.object({
  fontFamily: z
    .union([z.enum(fontOptions as [string, ...string[]]), z.literal("")])
    .optional(),
  fontSize: z.number().min(0.5).max(6).optional(),
  color: hexColorOrEmpty,
  backgroundColor: hexColorOrEmpty,
  fontWeight: z
    .union([z.enum(["400", "500", "600", "700", "800"]), z.literal("")])
    .optional(),
  letterSpacing: z.number().min(-0.5).max(0.5).optional(),
  lineHeight: z.number().min(0.5).max(3).optional(),
});

export const typographySchema = z.object({
  h1: typographyRoleSchema.optional(),
  h2: typographyRoleSchema.optional(),
  h3: typographyRoleSchema.optional(),
  h4: typographyRoleSchema.optional(),
  body: typographyRoleSchema.optional(),
  small: typographyRoleSchema.optional(),
  button: typographyRoleSchema.optional(),
  link: typographyRoleSchema.optional(),
});

export type TypographyRoleValues = z.infer<typeof typographyRoleSchema>;
export type TypographyValues = Partial<Record<TypographyRole, TypographyRoleValues>>;

export const styleSettingsSchema = z.object({
  fontHeading: z.enum(fontOptions as [string, ...string[]]),
  fontBody: z.enum(fontOptions as [string, ...string[]]),
  baseFontSize: z.enum(["small", "medium", "large"]),
  typography: typographySchema,
});

export type StyleSettingsValues = z.infer<typeof styleSettingsSchema>;
