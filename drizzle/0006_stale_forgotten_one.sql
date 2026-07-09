ALTER TABLE "contact_submissions" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "contact_submissions" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "contact_submissions" ALTER COLUMN "message" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "contact_submissions" ADD COLUMN "data" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "base_font_size" text DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "typography" jsonb DEFAULT '{}'::jsonb NOT NULL;