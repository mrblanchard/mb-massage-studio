import { z } from "zod";

export const userFormSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    name: z.string().optional(),
    role: z.enum(["owner", "editor"]),
    password: z.string().optional(),
  })
  .refine((data) => !data.password || data.password.length >= 8, {
    message: "Password must be at least 8 characters",
    path: ["password"],
  });

export type UserFormValues = z.infer<typeof userFormSchema>;

export const userFormDefaultValues: UserFormValues = {
  email: "",
  name: "",
  role: "editor",
  password: "",
};
