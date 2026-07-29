# ReplyBee — Instagram Auto-Reply SaaS

Automatically reply to comments on your Instagram posts based on keyword rules.
1 day free trial, then ₹5/month.

## Stack
- **Next.js 14** (App Router) + **Tailwind CSS** — landing page, pricing, dashboard, admin UI
- **NextAuth** (credentials/email+password) — authentication
- **Prisma + SQLite** (swap to Postgres for production) — database
- **Instagram Graph API** — real comment webhook + reply sending

## 1. Install & run locally

```bash
npm install
cp .env.example .env      # fill in NEXTAUTH_SECRET at minimum
npx prisma db push        # creates the SQLite database + tables
npm run dev
```

Visit http://localhost:3000. Sign up — the **first account created automatically
becomes an admin** (visit `/admin` after logging in).

## 2. How the free trial + ₹5/month subscription works

- On signup, `lib/subscription.ts` creates a `Subscription` row with
  `status = TRIALING` and `trialEndsAt = now + 1 day`.
- `isSubscriptionActive()` is checked before every auto-reply is sent
  (see `app/api/webhooks/instagram/route.ts`) — if the trial has expired and
  there's no active paid subscription, automation is silently skipped and the
  dashboard shows a "Subscribe" prompt.
- `app/api/subscription/route.ts` has a stub `POST` handler where you plug in
  a real payment provider. **Razorpay** is the natural choice for ₹ pricing:
  1. Create a Razorpay Plan for ₹5/month.
  2. On "Subscribe" click, create a Razorpay Subscription + open Razorpay
     Checkout on the client.
  3. In a `/api/webhooks/razorpay` route, verify the webhook signature and on
     `subscription.charged` call `activateSubscriptionAfterPayment()` from
     `lib/subscription.ts` to flip the user to `ACTIVE`.
  4. On `subscription.cancelled`/failed renewal, set status to `CANCELED` /
     `PAST_DUE`.
- Admins can also manually flip any user's status from `/admin` (handy for
  testing, comps, or manual UPI payments).

## 3. Connecting real Instagram accounts

Instagram's Graph API requires a Meta developer app and an Instagram
Business/Creator account linked to a Facebook Page. Real accounts **cannot**
be auto-replied to without this setup (Meta reviews the app for the
`instagram_manage_comments` permission before production use).

Steps:
1. Create an app at https://developers.facebook.com → add the
   **Instagram Graph API** product.
2. Under **Webhooks**, subscribe to the `comments` field on the `Instagram`
   object, and set the callback URL to:
   `https://yourdomain.com/api/webhooks/instagram`
   Use the same string for "Verify Token" as `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`
   in your `.env`.
3. Implement the OAuth redirect (Login with Instagram) to get a long-lived
   access token + the account's `igUserId`/`username`, then POST those to
   `/api/instagram/connect` (the dashboard currently has a manual-entry form
   at the same endpoint so you can test end-to-end before building the full
   OAuth screen).
4. Once connected, any comment on that account's posts triggers a webhook
   POST → `app/api/webhooks/instagram/route.ts` matches it against your
   `AutoReplyRule`s and calls the Graph API `/{comment-id}/replies` endpoint
   to send the reply automatically.

Until step 1–3 are wired to your own Meta app, the app is fully functional
for building/testing rules, auth, billing gating, and the admin panel — only
the live Instagram connection needs your credentials.

## 4. Project structure

```
app/
  page.tsx                landing page
  pricing/page.tsx         pricing page
  login/, signup/          auth pages
  dashboard/               user dashboard + rules manager
  admin/                   admin panel
  api/
    auth/[...nextauth]     NextAuth handler
    signup                 create account + start trial
    rules, rules/[id]      auto-reply rule CRUD
    instagram/connect      save Instagram account + token
    webhooks/instagram     Meta webhook verify (GET) + comment handler (POST)
    subscription           subscription status + upgrade stub
    admin/users, admin/subscriptions   admin data + manual overrides
lib/
  prisma.ts                Prisma client
  auth.ts                  NextAuth config
  subscription.ts          trial/plan logic (₹5/month, 1-day trial)
prisma/schema.prisma       User, Subscription, InstagramAccount, AutoReplyRule, CommentLog
```

## 5. Deploying: Vercel (app) + Render (database) — recommended

Vercel is built by the Next.js team, so the app deploys with zero config.
Render hosts the Postgres database. Netlify/Render is documented below too
if you'd rather use that combo instead.

### Step 1 — Create the database on Render
1. Render dashboard → **New > PostgreSQL**. Name it, pick a region, free or paid tier.
2. Once it's created, open it and copy the **External Database URL**
   (looks like `postgresql://user:pass@host.render.com:5432/dbname`).

### Step 2 — Push the schema to that database
On your own machine (needs network access to Render):
```bash
export DATABASE_URL="postgresql://...from Render..."
npx prisma db push
```
This creates all the tables (User, Subscription, InstagramAccount, etc.).

### Step 3 — Push your code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourname/ig-autoreply.git
git push -u origin main
```

### Step 4 — Import into Vercel
1. Go to https://vercel.com → **Add New > Project** → import the GitHub repo.
2. Vercel auto-detects Next.js — leave build settings as default
   (`npm run build`, output handled automatically).
3. Before clicking Deploy, add environment variables (or add them right after
   in **Settings > Environment Variables**):
   - `DATABASE_URL` — the Render Postgres URL from Step 1
   - `NEXTAUTH_SECRET` — a long random string (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` — your Vercel URL, e.g. `https://ig-autoreply.vercel.app`
     (you'll know this after the first deploy — update it and redeploy once you have it)
   - `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (once billing is wired up)
4. Click **Deploy**. Vercel builds and gives you a live URL.

### Step 5 — Point Instagram's webhook at your live app
In your Meta App's Instagram webhook settings, set the callback URL to:
`https://your-app.vercel.app/api/webhooks/instagram`
with the verify token matching `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`.

### Notes / gotchas
- Every push to `main` auto-redeploys on Vercel — but schema changes need
  `npx prisma db push` run manually, Vercel doesn't run it for you.
- Free Render Postgres can sleep after inactivity — upgrade to a paid
  instance before onboarding real users.
- Vercel's free (Hobby) tier is generous but has some limits on function
  duration/usage — fine to start, check Vercel's pricing page as you grow.

## 5b. Alternative: Netlify (app) + Render (database)

This app is set up to run as: **Netlify hosts the Next.js app** (via
`@netlify/plugin-nextjs`, already in `netlify.toml`), **Render hosts a managed
Postgres database**. Netlify's functions are stateless/ephemeral, so SQLite
cannot be used there — the schema is already switched to `postgresql`.

### Step 1 — Create the database on Render
1. Render dashboard → **New > PostgreSQL**. Pick a name/region, free or paid tier.
2. Once created, open it and copy the **External Database URL**
   (`postgresql://...`).

### Step 2 — Push the schema to that database
Locally (or in any machine with network access):
```bash
export DATABASE_URL="postgresql://...from Render..."
npx prisma db push
```
This creates all tables (User, Subscription, InstagramAccount, etc.) in Render's Postgres.

### Step 3 — Deploy the app to Netlify
1. Push this repo to GitHub/GitLab/Bitbucket.
2. Netlify dashboard → **Add new site > Import an existing project** → pick the repo.
   Netlify auto-detects `netlify.toml` (build command `npm run build`, Next.js plugin).
3. Under **Site settings > Environment variables**, add:
   - `DATABASE_URL` — the same Render Postgres URL from Step 1
   - `NEXTAUTH_SECRET` — a long random string
   - `NEXTAUTH_URL` — your Netlify site URL, e.g. `https://your-app.netlify.app`
   - `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (once billing is wired up)
4. Deploy. Netlify runs `npm install && npm run build`; `postinstall` runs
   `prisma generate` automatically.
5. Once live, use `https://your-app.netlify.app/api/webhooks/instagram` as
   the webhook callback URL in your Meta App's Instagram webhook settings.

### Notes / gotchas
- Every deploy re-runs `prisma generate`, but **not** `prisma db push` — schema
  changes need `npx prisma db push` run manually (or add it as a one-off Render/CI
  step) whenever you edit `prisma/schema.prisma`.
- Free Render Postgres instances sleep/expire after a period of inactivity on
  the free tier — fine for testing, upgrade to a paid instance before real users.
- If you'd rather run everything as a single Node service instead of split
  across two providers, Render also supports deploying the whole Next.js app
  itself (New > Web Service, build `npm run build`, start `npm start`) — in
  that case you don't need Netlify at all, one Render Postgres + one Render
  Web Service is enough.

## 7. Production checklist

- Swap `DATABASE_URL` to Postgres (Neon, Supabase, RDS, etc.) and change the
  `provider` in `prisma/schema.prisma` to `"postgresql"`.
- Encrypt `InstagramAccount.accessToken` at rest (e.g. with a KMS-backed
  library) rather than storing it in plaintext.
- Add a scheduled job (cron / Vercel Cron) to flip expired trials to
  `EXPIRED` and email users before/at trial end.
- Wire Razorpay (or Stripe if you'd rather bill in another currency) as
  described above.
