# Per-Client Setup

This repo is a clone-and-deploy template: every client gets their own copy of
this codebase, their own Neon database, their own R2 media bucket, and their
own Coolify app + domain. Follow these steps in order for each new client.

## 1. Create the client's repo

1. On GitHub, use **"Use this template" → "Create a new repository"** to create
   a new repo for the client (don't fork — a template repo starts the new repo
   with a clean history).
2. Clone the new repo locally and run `npm install`.

## 2. Database (Neon)

1. Create a new Neon project for this client (one project per client).
2. Copy the pooled connection string — this is `DATABASE_URL`.
3. Create `.env` from `.env.example` and set `DATABASE_URL` to that connection
   string.
4. Apply the schema:

   ```
   npm run db:migrate
   ```

   This replays the versioned SQL migrations in `/drizzle` against the new
   database, so every client ends up on the same schema history.

## 3. Seed the owner account + starter content

With `DATABASE_URL` still set in `.env`, run:

```
SEED_OWNER_EMAIL="owner@client.com" SEED_OWNER_PASSWORD="a-strong-password" npm run seed
```

(Omit the env vars to be prompted interactively instead.) This creates:

- the owner login (`role: "owner"`)
- a default `site_settings` row (placeholder name/tagline/nav links)
- a starter home page with hero/about/services/contact sections

Re-running `npm run seed` is safe — it skips anything that already exists.

## 4. Media storage (Cloudflare R2)

1. In the Cloudflare dashboard, create an R2 bucket for this client.
2. Enable public access for the bucket (custom domain or the `r2.dev` URL) —
   this becomes `R2_PUBLIC_URL` (no trailing slash).
3. Under **R2 → Manage API Tokens**, create a token scoped to this bucket with
   read/write access. This gives you `R2_ACCESS_KEY_ID` and
   `R2_SECRET_ACCESS_KEY`.
4. Fill in `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
   `R2_BUCKET_NAME`, and `R2_PUBLIC_URL` in `.env`.
5. Under the bucket's **Settings → CORS Policy**, add a policy allowing
   browser uploads from your dev and production origins, e.g.:
   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
   Without this, browser uploads fail with a generic "Failed to fetch"
   error (the presigned PUT to R2 gets blocked by CORS).

## 5. DNS (Cloudflare)

Add a DNS record for the client's domain (e.g. `A` or `CNAME`) pointing at
the Linode server's IP, proxied through Cloudflare (orange cloud) for CDN +
Web Analytics.

## 6. Deploy (Coolify)

1. In Coolify, create a new **Application** from the client's git repo. Coolify
   will detect and build the `Dockerfile`.
2. Set **environment variables** (Coolify → app → Environment Variables) using
   the values from the client's `.env`. See the
   [Environment variable reference](#environment-variable-reference) below —
   **five of these must also be marked as "Build Variables"** so they're
   available during `npm run build` inside the Docker image, not just at
   runtime:

   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_CF_ANALYTICS_TOKEN`
   - `R2_PUBLIC_URL`

   Generate `AUTH_SECRET` with `npx auth secret` if you haven't already.

   Also set `AUTH_TRUST_HOST=true` as a normal (runtime-only) environment
   variable — required because the app sits behind Coolify's reverse proxy.
   Without it, every `/api/auth/*` request fails with an `UntrustedHost`
   error.

3. Attach the client's domain (from step 5) to the app and enable SSL.
4. Deploy.

## 7. Go live

1. Visit `https://<client-domain>/admin/login` and sign in with the owner
   credentials from step 3.
2. Go to `/admin/settings` and replace the placeholder site name, tagline, nav
   links, branding colors/fonts, business info, social links, and contact
   email with the client's real details.
3. Edit the home page sections (and add/remove sections as needed) via Edit
   Mode to replace the starter placeholder copy with real content.

> Note: there's currently no in-app "change password" UI. Choose a strong
> password during seeding (step 3) — that's the credential the owner will use
> going forward.

---

## Local image testing (Podman)

Before deploying, you can build and run the production image locally with
Podman (a drop-in replacement for the `docker` CLI — `podman build`/
`podman run` work the same way).

Build, passing the same five build-time variables as `--build-arg`s (use the
values from your local `.env`):

```
podman build `
  --build-arg DATABASE_URL="..." `
  --build-arg AUTH_SECRET="..." `
  --build-arg NEXT_PUBLIC_SITE_URL="http://localhost:3000" `
  --build-arg NEXT_PUBLIC_CF_ANALYTICS_TOKEN="" `
  --build-arg R2_PUBLIC_URL="" `
  -t client-site .
```

Run it, passing the remaining runtime variables:

```
podman run --rm -p 3000:3000 `
  -e DATABASE_URL="..." `
  -e AUTH_SECRET="..." `
  -e AUTH_TRUST_HOST="true" `
  -e R2_ACCOUNT_ID="..." `
  -e R2_ACCESS_KEY_ID="..." `
  -e R2_SECRET_ACCESS_KEY="..." `
  -e R2_BUCKET_NAME="..." `
  client-site
```

> Don't use `--env-file .env` here — `.env` is formatted for dotenv (quoted
> values like `KEY="value"`), but `podman --env-file` takes the values
> literally, including the quote characters, which breaks the database
> connection string. Pass values with `-e` instead, or create a separate
> unquoted env file for Podman.

Then open `http://localhost:3000`.

---

## Environment variable reference

| Variable | Build-time? | Where it's used |
| --- | --- | --- |
| `DATABASE_URL` | Yes | DB connection (also queried by `/sitemap.xml` and `/robots.txt` during build) |
| `AUTH_SECRET` | Yes | Auth.js session signing |
| `AUTH_TRUST_HOST` | No | Set to `true` in production so Auth.js trusts the reverse proxy's `Host` header |
| `NEXT_PUBLIC_SITE_URL` | Yes | Absolute URLs for sitemap/OG/metadata; inlined into the client bundle |
| `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` | Yes | Cloudflare Web Analytics beacon; inlined into the client bundle (falls back to `/admin/settings` value if empty) |
| `R2_PUBLIC_URL` | Yes | Baked into `next/image`'s allowed remote patterns |
| `R2_ACCOUNT_ID` | No | R2 S3 API endpoint |
| `R2_ACCESS_KEY_ID` | No | R2 S3 API credentials |
| `R2_SECRET_ACCESS_KEY` | No | R2 S3 API credentials |
| `R2_BUCKET_NAME` | No | R2 bucket for media uploads |
| `RESEND_API_KEY` | No | Contact form email notifications (optional — skipped if empty) |
| `RESEND_FROM_EMAIL` | No | Sender address for contact form emails |
| `CONTACT_EMAIL_TO` | No | Recipient for contact form emails (falls back to `/admin/settings` contact email) |

"Build-time" variables must be set as Coolify **Build Variables** (in addition
to normal runtime env vars) and passed as `--build-arg` for local Podman
builds, because they're baked into the production build output and can't be
changed by setting an env var on the running container afterward.
