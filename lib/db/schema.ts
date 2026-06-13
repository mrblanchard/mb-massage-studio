import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["owner", "editor"]);

export const sectionTypeEnum = pgEnum("section_type", [
  "hero",
  "about",
  "services",
  "gallery",
  "testimonials",
  "cta",
  "contact",
  "rich_text",
  "blog_list",
]);

export const socialPlatformEnum = pgEnum("social_platform", [
  "x",
  "facebook",
  "instagram",
  "linkedin",
]);

export const socialPostStatusEnum = pgEnum("social_post_status", [
  "draft",
  "scheduled",
  "posted",
  "failed",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  role: userRoleEnum("role").notNull().default("owner"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  siteName: text("site_name").notNull().default(""),
  tagline: text("tagline"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  primaryColor: text("primary_color").default("#171717"),
  secondaryColor: text("secondary_color").default("#f5f5f5"),
  fontHeading: text("font_heading").default("Inter"),
  fontBody: text("font_body").default("Inter"),
  navLinks: jsonb("nav_links")
    .$type<{ label: string; href: string }[]>()
    .notNull()
    .default([]),
  socialLinks: jsonb("social_links")
    .$type<Record<string, string>>()
    .notNull()
    .default({}),
  businessInfo: jsonb("business_info")
    .$type<{
      address?: string;
      phone?: string;
      email?: string;
      hours?: string;
    }>()
    .notNull()
    .default({}),
  contactEmail: text("contact_email"),
  cfAnalyticsToken: text("cf_analytics_token"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(), // "" = home page
  title: text("title").notNull(),
  metaDescription: text("meta_description"),
  ogImage: text("og_image"),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sections = pgTable("sections", {
  id: uuid("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  pageId: uuid("page_id")
    .notNull()
    .references(() => pages.id, { onDelete: "cascade" }),
  type: sectionTypeEnum("type").notNull(),
  order: integer("order").notNull().default(0),
  content: jsonb("content").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  coverImage: text("cover_image"),
  content: jsonb("content").$type<Record<string, unknown>>().notNull().default({}),
  published: boolean("published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  authorId: uuid("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const media = pgTable("media", {
  id: uuid("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(),
  url: text("url").notNull(),
  filename: text("filename"),
  alt: text("alt"),
  contentType: text("content_type"),
  size: integer("size"),
  width: integer("width"),
  height: integer("height"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Social poster: schema/UI scaffolded now, no live platform connector wired up yet.
export const socialPosts = pgTable("social_posts", {
  id: uuid("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  content: text("content").notNull(),
  mediaUrls: jsonb("media_urls").$type<string[]>().notNull().default([]),
  platforms: jsonb("platforms").$type<string[]>().notNull().default([]),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  status: socialPostStatusEnum("status").notNull().default("draft"),
  errorMessage: text("error_message"),
  postedAt: timestamp("posted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const socialConnectors = pgTable("social_connectors", {
  id: uuid("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  platform: socialPlatformEnum("platform").notNull(),
  connectedAccountName: text("connected_account_name"),
  credentials: jsonb("credentials").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const pagesRelations = relations(pages, ({ many }) => ({
  sections: many(sections),
}));

export const sectionsRelations = relations(sections, ({ one }) => ({
  page: one(pages, {
    fields: [sections.pageId],
    references: [pages.id],
  }),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
