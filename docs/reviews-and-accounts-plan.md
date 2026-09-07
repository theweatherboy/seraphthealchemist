# Reviews, customer accounts, and administration

Status: the owner connected a development/preview Supabase resource and configured Google OAuth. The local account foundation is implemented; see `accounts-setup.md` for the SQL migration and live-login setup still to complete. Review endpoints and service-verification controls remain planned.

## Recommended foundation

- Keep the website on Vercel.
- Use Supabase Postgres for relational data and Supabase Auth for Google sign-in.
- Use Next.js server actions/route handlers for authenticated operations, backed by database constraints and Row Level Security (RLS).
- Use the existing artwork assets as they are. Blob storage and a cache are not required for the first reviews release.
- Change Next.js from static export to its normal Vercel server deployment when adding server-side authentication. The current `output: 'export'` cannot serve the proposed dynamic server endpoints. Keep public content statically optimized where appropriate.
- The existing GitHub Pages deployment workflow builds `out/` and will no longer suit this application after that transition. Retire or replace that workflow as part of the migration; confirm Vercel's production branch and domain.

## Customer experience

1. Sign in with Google; on first successful authentication, provision a site profile tied to the immutable auth user ID.
2. Choose a public display name. Do not publish the Google email or photo automatically.
3. See completed, review-eligible service instances in My Account.
4. Submit a testimony for a specific completed service. No eligible service means no review submission.
5. The review enters moderation. Approved reviews appear on `/reviews`.
6. The public page groups approved reviews by an opaque public profile identifier tied to the account, never by the display name or email. Each person has one expandable section with a review count and latest review preview; expanding shows their service history testimonies with dates and service names. Paginate groups and expanded histories as data grows.
7. A customer may edit their own testimony; the revised version must be moderated before publication. They may withdraw it immediately. Repeated sessions permit separate reviews, with one review thread per completed service instance. Later reflections about the same session can update that thread in the first version.

Grouping is per site account, not a guarantee of one account per human. Explain that publishing multiple testimonies under an account connects them publicly. Offer a chosen public name/initials; no public account directory is needed.

## Verification and moderation

Google login establishes an account identity, not purchase or service completion.

Initially the administrator selects a signed-up customer and records the service delivered, completion date, payment method and a private reference as needed. This unlocks the testimony form for that exact customer/service instance. Existing clients can sign in before the administrator links their historical service. No automatic matching by public names.

Verification and moderation remain separate: a completed service makes a review eligible; moderation decides whether the customer's submitted text can be published. The badge should say `Verified service` and explain that Seraph confirmed service completion, rather than implying independent payment-provider verification.

Moderate spam, private information and abusive content consistently; do not gate approval on whether a testimony is favorable. Record an internal moderation reason. Administrators approve, reject, or hide reviews, but do not rewrite customers' testimony text.

Later, authenticated Stripe Checkout can attach the site user and service IDs to checkout metadata. A signature-verified webhook with unique event IDs can record payment idempotently. A paid checkout still does not prove a session happened: completion remains a separate admin action. The current generic payment links cannot establish that connection automatically. Cash App, PayPal and Venmo remain manually reconciled initially.

## Proposed data model

| Record | Purpose and important constraints |
| --- | --- |
| Supabase auth users | Identity, provider and session management; never public. |
| profiles | One per auth user; chosen display name, separate opaque public identifier, timestamps. No self-editable admin field. |
| admin_memberships | Restricted user-ID membership; only trusted provisioning may add administrators. Ordinary users cannot create or change membership. |
| services | Stable ID and existing unique service slug/title; keep the current site catalog as the initial source, with an explicit seed migration. |
| service_instances | Customer ID, service ID, historical service title, completion state/date, verification source, verified-by admin ID. A customer can have many instances of the same service. |
| payment_records | Optional private provider/reference, amount/currency, payment state and reconciliation actor. Separate payment and fulfillment state; no card details. |
| reviews | One unique service-instance link and owner; publication/withdrawal state and approved revision pointer. Database ownership must match the service instance. |
| review_revisions | Immutable submitted text versions, author, creation time and moderation outcome. New edits do not replace approved text until reviewed. |
| moderation_events | Actor, review/revision ID, decision, private reason and timestamp. |

Use foreign keys, unique constraints, bounded text lengths, timestamps, and transactions for integrity. Decide account deletion, retention, and anonymization behavior before implementing cascading deletes on service/payment records.

## Operations (CRUD)

CRUD means create, read, update and delete. Provide specific operations rather than an unrestricted generic table editor:

- Public: list approved reviewer groups and load a group's approved testimonies.
- Customer: read/update own public profile; list own service instances and review states; submit a review; submit a revision; withdraw a review.
- Admin: locate customers; create and correct service records; mark completion/revoke verification; review the moderation queue; approve/reject a revision; hide a published review.
- If verification is revoked, its testimony must stop appearing publicly in the same transaction or by the public query's eligibility rule.

Every operation validates the session, permission and input on the server. RLS and restricted column/function grants provide a second boundary: customers cannot impersonate owners, set completion, change moderation status or promote themselves. Handle concurrent duplicate submissions with database uniqueness rather than a UI-only check.

Expose public results using an explicitly restricted projection/function that returns only public display names/IDs, approved testimony content, public service titles and relevant dates. Do not accidentally expose all columns through a view or bypass underlying RLS. Never send private email, payment references, moderation notes, or full auth records to the public browser.

Bootstrap the first administrator using the verified account's immutable user ID through a trusted migration/dashboard operation. Use the same Google login for the administrator and customers, with server-enforced permissions for `/admin`. Do not treat a hidden route or a frontend email comparison as access control.

## Build sequence

1. Confirm production domain/branch; provision and connect Supabase; configure Google OAuth and exact callback allowlists. Keep development/preview data separate from production.
2. Add versioned schema migrations, RLS policies, the seed catalog, generated database types, and authorization tests.
3. Migrate from static export to Vercel server deployment; implement login/callback/logout, cookie-based sessions, profile provisioning and account page.
4. Build the protected admin service-verification workflow and review eligibility checks.
5. Build submission/revision/withdrawal operations, moderation dashboard, and the collapsible public reviews page styled to match the sanctuary.
6. Test with separate admin, customer A, customer B, and signed-out sessions in a Vercel preview; run migrations deliberately before deploying the dependent production code.
7. Add payment automation and notifications later, once the verified-service workflow is proven.

## External setup needed

- In Vercel Storage/Marketplace select Supabase and connect it to this project. Review the selected plan and region before creation; align the database region with server execution where practical.
- In Google Cloud / Google Auth Platform configure branding, audience and a Web OAuth client with basic identity scopes. Register Supabase's Google callback URL; enter the client ID/secret in Supabase's Google provider settings.
- Set the Supabase site URL and allowed app callback URLs for production and local development. Avoid broad production redirect wildcards.
- Put the Supabase project URL and publishable key in the project's appropriate environment settings. If privileged server credentials are required, keep them server-only. Keep the Google OAuth secret in provider settings; never commit credentials or paste secrets into chat.
- Decide which signed-in account is the owner/admin. The existing contact mailbox is a candidate, not an automatic grant.

## Acceptance checks

- A new Google login creates one profile and returning login reuses it.
- Users without a completed service cannot submit even through a direct API request.
- Customer A cannot view/change customer B's private data or submit against B's service.
- Ordinary users cannot approve reviews, mark services completed or grant admin access.
- Duplicate and concurrent submissions respect one thread per service instance.
- Pending, rejected, withdrawn and ineligible reviews never appear in public responses.
- Unapproved edits never silently replace the approved public testimony.
- Grouping survives display-name changes; distinct accounts with the same name remain separate.
- Expanded groups, form errors and admin actions work by keyboard and on mobile.
- Login/logout, expired sessions and callback errors behave correctly on Vercel previews and production without cross-user caching.
- Public responses and client bundles contain no private references or secret keys.

## Primary references

- https://vercel.com/marketplace/supabase
- https://vercel.com/docs/storage
- https://supabase.com/docs/guides/integrations/vercel-marketplace
- https://supabase.com/docs/guides/auth/social-login/auth-google
- https://supabase.com/docs/guides/auth/server-side
- https://supabase.com/docs/guides/database/postgres/row-level-security
- Installed Next.js guides: `node_modules/next/dist/docs/01-app/02-guides/authentication.md` and `static-exports.md`.
