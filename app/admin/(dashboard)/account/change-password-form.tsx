"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  changePasswordDefaultValues,
  changePasswordSchema,
  type ChangePasswordValues,
} from "@/lib/account/schema";

import { changePassword } from "./actions";

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: changePasswordDefaultValues,
  });

  const onSubmit = (values: ChangePasswordValues) => {
    startTransition(async () => {
      const result = await changePassword(values);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Password updated.");
      reset(changePasswordDefaultValues);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex max-w-sm flex-col gap-4">
      <FieldGroup>
        <Controller
          control={control}
          name="currentPassword"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="newPassword"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="newPassword">New password</FieldLabel>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>
      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Updating..." : "Update password"}
        </Button>
      </div>
    </form>
  );
}
