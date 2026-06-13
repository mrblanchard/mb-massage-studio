"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";

export async function loginAction(values: { email: string; password: string }) {
  try {
    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }

    throw error;
  }
}
