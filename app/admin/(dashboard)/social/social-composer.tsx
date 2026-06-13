"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { ImageUpload } from "@/components/edit/image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SocialPost } from "@/lib/db/queries/social-posts";
import {
  platformLabels,
  socialComposerDefaultValues,
  socialComposerFormSchema,
  socialPlatformValues,
  type SocialComposerFormValues,
  type SocialPlatform,
  type SocialPostInput,
} from "@/lib/social/schema";

import { createSocialPost, updateSocialPost } from "./actions";

function toDatetimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toDefaultValues(post: SocialPost | null): SocialComposerFormValues {
  if (!post) {
    return socialComposerDefaultValues;
  }

  return {
    content: post.content,
    mediaUrls: post.mediaUrls.map((url) => ({ url })),
    platforms: post.platforms as SocialPlatform[],
    scheduledAt: post.scheduledAt ? toDatetimeLocalValue(post.scheduledAt) : "",
  };
}

const statusVariants = {
  draft: "outline",
  scheduled: "secondary",
  posted: "default",
  failed: "destructive",
} as const;

export function SocialComposer({ post }: { post: SocialPost | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit } = useForm<SocialComposerFormValues>({
    resolver: zodResolver(socialComposerFormSchema),
    defaultValues: toDefaultValues(post),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "mediaUrls" });

  const onSubmit = (values: SocialComposerFormValues) => {
    const payload: SocialPostInput = {
      content: values.content,
      mediaUrls: values.mediaUrls.map((media) => media.url),
      platforms: values.platforms,
      scheduledAt: values.scheduledAt || undefined,
    };

    startTransition(async () => {
      const result = post ? await updateSocialPost(post.id, payload) : await createSocialPost(payload);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Post saved.");

      if (!post && "id" in result) {
        router.push(`/admin/social/${result.id}`);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {post && (
        <div className="flex items-center gap-2">
          <Badge variant={statusVariants[post.status]}>{post.status}</Badge>
          {post.status === "failed" && post.errorMessage && (
            <span className="text-sm text-muted-foreground">{post.errorMessage}</span>
          )}
        </div>
      )}
      <FieldGroup>
        <Controller
          control={control}
          name="content"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="content">Post content</FieldLabel>
              <Textarea id="content" rows={5} {...field} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="platforms"
          render={({ field, fieldState }) => (
            <FieldSet data-invalid={fieldState.invalid || undefined}>
              <FieldLegend variant="label">Platforms</FieldLegend>
              <FieldGroup data-slot="checkbox-group">
                {socialPlatformValues.map((platform) => (
                  <Field key={platform} orientation="horizontal">
                    <Checkbox
                      id={`platform-${platform}`}
                      checked={field.value.includes(platform)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...field.value, platform]);
                        } else {
                          field.onChange(field.value.filter((value) => value !== platform));
                        }
                      }}
                    />
                    <FieldLabel htmlFor={`platform-${platform}`}>{platformLabels[platform]}</FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
              <FieldError errors={[fieldState.error]} />
            </FieldSet>
          )}
        />
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Image {index + 1}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Remove image"
                onClick={() => remove(index)}
              >
                <Trash2 />
              </Button>
            </div>
            <Controller
              control={control}
              name={`mediaUrls.${index}.url`}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <ImageUpload value={field.value} onChange={field.onChange} />
                  <FieldDescription>Best size: 1080×1080px (square) or 1200×675px (16:9).</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => append({ url: "" })}>
          <Plus /> Add image
        </Button>
        <Controller
          control={control}
          name="scheduledAt"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="scheduledAt">Schedule for (optional)</FieldLabel>
              <Input id="scheduledAt" type="datetime-local" {...field} />
              <FieldDescription>Leave blank to save as a draft.</FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>
      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save post"}
        </Button>
      </div>
    </form>
  );
}
