"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User } from "@/lib/db/queries/users";
import { userFormDefaultValues, userFormSchema, type UserFormValues } from "@/lib/users/schema";

import { createUser, updateUser } from "./actions";

const roleItems = { owner: "Owner", editor: "Editor" };

function toDefaultValues(user: User | null): UserFormValues {
  if (!user) {
    return userFormDefaultValues;
  }

  return {
    email: user.email,
    name: user.name ?? "",
    role: user.role,
    password: "",
  };
}

export function UserForm({ user }: { user: User | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: toDefaultValues(user),
  });

  const onSubmit = (values: UserFormValues) => {
    startTransition(async () => {
      const result = user ? await updateUser(user.id, values) : await createUser(values);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("User saved.");

      if (!user && "id" in result) {
        router.push(`/admin/users/${result.id}`);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex max-w-sm flex-col gap-4">
      <FieldGroup>
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" autoComplete="email" aria-invalid={fieldState.invalid} {...field} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input id="name" aria-invalid={fieldState.invalid} {...field} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="role"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="role">Role</FieldLabel>
              <Select
                items={roleItems}
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>Owners can manage site users; editors cannot.</FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="password">{user ? "New password" : "Password"}</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldDescription>
                {user ? "Leave blank to keep the current password." : "At least 8 characters."}
              </FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>
      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save user"}
        </Button>
      </div>
    </form>
  );
}
