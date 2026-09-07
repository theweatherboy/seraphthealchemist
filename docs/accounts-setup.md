# Account foundation: setup and launch checklist

This first milestone adds Google login/logout, a private account page, editable public display names, and a database-protected admin entry page. Service records, review submission, moderation, and the grouped public reviews page are the next milestone, not implemented controls in this release.

## Runtime

Use Node 22 (also set by `package.json` for Vercel). Next.js now runs as a server application; `next build` no longer creates a deployable static `out/` folder. The old GitHub Pages workflow is replaced by build/security-test CI. Vercel's Git integration remains responsible for deployments. Check the Vercel production branch is `master` before publishing.

The Supabase resource `seraph-sanctuary` is connected to Development and Preview only. Keep production customer data out of this database. Missing configuration leaves public pages working and shows an honest sign-in-unavailable state.

## Local environment

Copy `.env.example` to `.env.local`. Fill in the development project URL and publishable key from Vercel's synced environment variables or Supabase's Connect dialog. Do not copy the secret/service-role key. `.env.local` is ignored by Git.

The server prefers the integration's `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` aliases if present, otherwise uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Rebuild after changing public-prefixed values; Next.js embeds those during compilation. Never set either publishable-key field to a secret key.

`SITE_URL=http://localhost:3000` is used when testing locally. On Vercel previews, omit `SITE_URL` to use the deployment's `VERCEL_URL`; register that exact URL plus `/auth/callback` in Supabase. If testing on a stable branch alias, set `SITE_URL` to that alias and register its callback. Production defaults to `https://www.seraphthealchemist.com`.

Google's Authorized redirect URI is the Supabase URL ending in `/auth/v1/callback`. Supabase's allowed app redirects are the website URLs ending in `/auth/callback`. Add the exact preview website origin to Google's authorized origins as needed. Keep the Google OAuth client secret in Supabase's provider settings.

## Install the database schema

Open the DEVELOPMENT Supabase project, then SQL Editor. Run the complete contents of:

`supabase/migrations/202609060001_accounts.sql`

Run once against the new project; do not rerun it over an already-installed schema. It creates profiles and admin memberships, enables RLS, restricts grants, and installs profile provisioning. It backfills any accounts created earlier. The transaction rolls back completely on failure.

After the account migration succeeds, run `supabase/migrations/202609060002_reviews.sql` once. It adds verified service records, pending testimonies, grouped public reviews, and admin moderation RPCs.

For service titles on public testimony cards, also run `supabase/migrations/202609070003_public_review_services.sql`. It exposes only review IDs and service titles for approved reviews whose service verification has not been revoked. Existing installations should apply this new migration without rerunning the first two migrations.

No administrator is granted automatically. The application uses only a publishable key and the signed-in user's session, never a privileged server key.

## First login and admin bootstrap

1. Run `npm run dev` using Node 22, then visit `http://localhost:3000/login`.
2. Continue with Google using an account on the Google OAuth testing allowlist.
3. Confirm you reach `/account`; change the public name and reload to verify persistence. Emails remain private.
4. In Supabase Authentication → Users, locate your confirmed account and copy its User UID.
5. In the trusted Supabase SQL Editor, run this after replacing both placeholders with the intended owner account:

```sql
insert into public.admin_memberships(user_id)
select id from auth.users
where id = 'REPLACE_WITH_OWNER_USER_UUID'::uuid
  and email = 'REPLACE_WITH_OWNER_EMAIL'
  and email_confirmed_at is not null
on conflict (user_id) do nothing;
```

Confirm one membership exists for the intended owner. Then reload `/account` and follow Open administration. Ordinary accounts get a not-found page at `/admin`; signed-out visitors are sent to login. No request form, user metadata, public display name, or frontend email comparison can grant admin access.

## Validation

- `npm run test:accounts` runs the real SQL migration in a local PostgreSQL engine, exercising backfill, signup trigger, private reads, profile edits, invalid names, cross-user isolation, privilege escalation attempts and anonymous access. It does not contact Supabase or prove hosted OAuth works.
- `npm run build` validates the Vercel application build.
- After building, `npm run test:auth` checks the HTTP sign-in callback, redirect restrictions, account edits, logout and admin access using a simulated loopback Supabase service. It explicitly overrides connection settings so tests do not contact the hosted database. These checks and the SQL permission tests passed locally on Node 22.
- Live OAuth still needs a real browser sign-in with the user; automated checks must not claim that this has passed without completing it.
- Verify logout, session expiry, rejected OAuth consent, the exact preview callback, and two distinct customer accounts before promoting the feature.

## Reminder before production launch

After building and testing, explicitly revisit the Supabase plan with the owner: Free may pause after a week of inactivity and lacks automatic backups. Decide whether to upgrade for availability and backups before real customers depend on accounts. Provision a separate production database, apply reviewed migrations, and enable production environment variables. Do not copy test users or records into production.

Google OAuth is currently in Testing mode. Prepare its production audience/publishing requirements before opening sign-in to all customers. Update the site's privacy description for account identity and future public testimonies before production launch.
