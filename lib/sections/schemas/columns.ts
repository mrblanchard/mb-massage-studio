import { z } from "zod";

export const payPalButtonSchema = z.object({
  hostedButtonId: z.string().min(1, "PayPal hosted button ID is required"),
  itemName: z.string().min(1, "Item name is required"),
  options: z
    .array(
      z.object({
        label: z.string().min(1, "Label is required"),
        value: z.string().min(1, "Value is required"),
      })
    )
    .min(1, "At least one option is required"),
});

export const venmoButtonSchema = z.object({
  handle: z.string().min(1, "Venmo username is required"),
});

export const squareButtonSchema = z.object({
  checkoutUrl: z.string().min(1, "Checkout link is required").url("Enter a valid URL"),
});

export const columnSchema = z.object({
  imageUrl: z.string().optional(),
  content: z.string().optional(),
  payPalButton: payPalButtonSchema.optional(),
  venmoButton: venmoButtonSchema.optional(),
  squareButton: squareButtonSchema.optional(),
  // Server-derived at render time (see resolvePageSections) — not user-editable.
  payPalQr: z.string().nullable().optional(),
  venmoQr: z.string().nullable().optional(),
  squareQr: z.string().nullable().optional(),
});

export type PayPalButton = z.infer<typeof payPalButtonSchema>;
export type VenmoButton = z.infer<typeof venmoButtonSchema>;
export type SquareButton = z.infer<typeof squareButtonSchema>;

export const columnsSchema = z.object({
  heading: z.string().optional(),
  columns: z.array(columnSchema).min(2).max(4),
});

export type Column = z.infer<typeof columnSchema>;
export type ColumnsContent = z.infer<typeof columnsSchema>;

export const columnsDefaultContent: ColumnsContent = {
  heading: "",
  columns: [
    { content: "<p>Column content goes here.</p>" },
    { content: "<p>Column content goes here.</p>" },
  ],
};
