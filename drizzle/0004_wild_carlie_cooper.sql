ALTER TYPE "public"."section_type" ADD VALUE 'two_column';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "enable_sidebar_nav" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "sidebar_nav_position" text DEFAULT 'left';