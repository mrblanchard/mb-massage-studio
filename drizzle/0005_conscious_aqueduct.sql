ALTER TYPE "public"."section_type" ADD VALUE 'columns';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "header_cta_label" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "header_cta_href" text;