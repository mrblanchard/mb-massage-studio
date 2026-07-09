import "dotenv/config";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { createInterface } from "node:readline/promises";

import { db } from "../lib/db";
import { pages, sections, siteSettings, users } from "../lib/db/schema";

async function promptCredentials() {
  if (process.env.SEED_OWNER_EMAIL && process.env.SEED_OWNER_PASSWORD) {
    return {
      email: process.env.SEED_OWNER_EMAIL.toLowerCase().trim(),
      password: process.env.SEED_OWNER_PASSWORD,
    };
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const email = (await rl.question("Owner email: ")).toLowerCase().trim();
    const password = await rl.question("Owner password: ");
    return { email, password };
  } finally {
    rl.close();
  }
}

async function seedOwner() {
  const { email, password } = await promptCredentials();

  if (!email || !password) {
    throw new Error("An owner email and password are required to seed the database.");
  }
  if (password.length < 8) {
    throw new Error("Owner password must be at least 8 characters.");
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) {
    console.log(`Owner account already exists for ${email}, skipping.`);
    return;
  }

  const passwordHash = await hash(password, 12);
  await db.insert(users).values({
    email,
    passwordHash,
    name: "Site Owner",
    role: "owner",
  });
  console.log(`Created owner account for ${email}.`);
}

async function seedSiteSettings() {
  await db
    .insert(siteSettings)
    .values({
      id: 1,
      siteName: "Your Business Name",
      tagline: "A short, memorable tagline goes here.",
      navLinks: [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
    })
    .onConflictDoNothing({ target: siteSettings.id });

  console.log("Site settings ready.");
}

async function seedHomePage() {
  let homePage = await db.query.pages.findFirst({
    where: eq(pages.slug, ""),
  });

  if (!homePage) {
    [homePage] = await db
      .insert(pages)
      .values({
        slug: "",
        title: "Home",
        metaDescription: "Welcome to our website.",
      })
      .returning();
    console.log("Created home page.");
  }

  const existingSections = await db.query.sections.findMany({
    where: eq(sections.pageId, homePage.id),
  });

  if (existingSections.length > 0) {
    console.log("Home page already has sections, skipping.");
    return;
  }

  await db.insert(sections).values([
    {
      pageId: homePage.id,
      type: "hero",
      order: 0,
      content: {
        heading: "Welcome to Your Business",
        subheading: "Tell visitors what you do and why it matters.",
        ctaLabel: "Get in Touch",
        ctaHref: "/contact",
      },
    },
    {
      pageId: homePage.id,
      type: "about",
      order: 1,
      content: {
        heading: "About Us",
        body: "<p>Share your story here. Explain who you are, what you offer, and what makes your business different.</p>",
      },
    },
    {
      pageId: homePage.id,
      type: "services",
      order: 2,
      content: {
        heading: "What We Offer",
        items: [
          { title: "Service One", description: "Describe this service." },
          { title: "Service Two", description: "Describe this service." },
          { title: "Service Three", description: "Describe this service." },
        ],
      },
    },
    {
      pageId: homePage.id,
      type: "contact",
      order: 3,
      content: {
        heading: "Get in Touch",
        body: "Have a question? Send us a message and we'll get back to you soon.",
      },
    },
  ]);

  console.log("Added starter sections to the home page.");
}

async function main() {
  await seedOwner();
  await seedSiteSettings();
  await seedHomePage();
}

main()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
