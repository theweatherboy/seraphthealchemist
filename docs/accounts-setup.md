# Account foundation: setup and launch checklist

Google login/logout, customer profiles, historical service verification, testimony submission and moderation, public testimonies, booking, and administration are implemented. Service names, subtitles, descriptions, prices, and displayed durations can now be edited in Admin ? Availability & Services after applying the catalog migration. Live production configuration must still be verified.

## Runtime

Use Node 22 (also set by `package.json` for Vercel). Next.js now runs as a server application; `next build` no longer creates a deployable static `out/` folder. The old GitHub Pages workflow is replaced by build/security-test CI. Vercel's Git integration remains responsible for deployments. Check the Vercel production branch is `master` before publishing.

The last recorded setup had the Supabase resource `seraph-sanctuary` connected to Development and Preview only; verify the current dashboard settings. Keep production customer data out of this database. Missing configuration leaves public pages working and shows an honest sign-in-unavailable state.

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


## Invite existing clients to leave testimonies

1. Before inviting clients, verify Vercel Production has the intended Supabase URL and publishable key. Apply all unapplied SQL migrations in filename order through `202609160008_service_catalog.sql`. Do not rerun older migrations that are already installed.
2. Verify Google sign-in is enabled for the intended client audience and the production site URL and exact `/auth/callback` redirect are configured in Supabase. The repository last recorded Google OAuth in Testing mode; confirm the current Google Auth Platform audience settings.
3. Sign in with the owner account and verify it has the intended admin membership. Test a separate customer account through sign-in, historical service confirmation, testimony submission, approval, and public display.
4. Send clients `https://www.seraphthealchemist.com/login`. Their first **Continue with Google** creates their account; you do not assign a password.
5. Ask the client to share the account ID shown in My account. In **Admin ? Testimonies ? Verify a completed service**, match the member's name and ID prefix, choose the offering, and enter the original completion date. No new booking or payment is required for past sessions.
6. Have the client reload My account and submit the testimony beside that session. Publish it from **Admin ? Testimonies** after review.

The catalog migration enables admin-only saved edits and seeds 15-minute Mini Cord Cut, 15-minute Mediumship, and 10-minute Psychic Reading booking policies. Default prices are $66, $99, and $77 respectively. Public offering text uses the saved catalog; confirmed historical service titles remain unchanged. Displayed duration describes the offering (including multi-session packages); actual appointment length, buffers, and booking caps remain under **Service limits**.

Primary configuration reference: https://supabase.com/docs/guides/auth/social-login/auth-google and https://supabase.com/docs/guides/auth/redirect-urls.
