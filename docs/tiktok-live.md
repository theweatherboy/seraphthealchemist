# TikTok LIVE queue

Updated October 21, 2026. Public page: `/tiktok-live`. Admin queue: `/admin/live`.

Visitors first choose Continue with Google (sign-in or account creation) or Continue as guest. Already signed-in visitors proceed directly to the form. Google returns to `/tiktok-live`; failed sign-in preserves that destination and offers a way back to guest access. The database records account/guest status from the authenticated session and links signed-in entries to the account ID. Manual entries are labeled separately; older entries show status not recorded. These details remain admin-only.

Visitors enter first and last name, optionally select one or more LIVE offerings, and accept the Terms of Service and Privacy Policy. Payment-method buttons appear once the required fields are complete. Choosing a method submits the queue entry and selections; its donation link appears only after the server saves successfully. No account, email, payment reference, or claim of prior payment is required.

Only explicit payment-method submission writes a queue entry. The server and database reject missing acknowledgments and invalid names or methods. Request UUIDs make retries idempotent, including after an admin corrects payment details. Public intake has a per-name burst limit; it is not identity verification or comprehensive bot protection.

Queue entries are private to administrators. New entries store first and last name, the selected method, policy timestamp/versions, and visitor/admin source. The actual donated amount starts unset and payment starts unverified. Older entries retain their offering snapshots and expected totals. No automatic payment verification occurs.

Administrators can edit the donated amount (including cents) and payment method, then use Confirm payment to save and verify together. Save as unverified saves corrections for later checking. They can also complete, remove, or restore entries. Removal archives the acknowledgment history. Manual entry requires policy acknowledgments and records the administrator's user ID. The queue refreshes every 20 seconds, pausing while a form has focus, and has pagination.

LIVE data lives only in `tiktok_live_queue`. It does not insert/update `service_requests`, availability, blocks, calendars, or testimony eligibility. Standard multiple-service scheduled booking remains deferred.

## Deployment

For optional birth details, apply `supabase/migrations/202610210024_live_birth_details.sql` after the offering-selection migration. It stores optional birth date, local time, and a selected birthplace (label and coordinates) privately on the LIVE entry. Each field may be omitted independently. Both Birth Chart and LIVE use `BirthDetailFields` and the existing `/api/birth-chart?q=...` city search. LIVE submission does not calculate a chart or save an account birth profile. The form discloses admin visibility; new entries record privacy version `2026-10-21`. The migration has not been applied to hosted Supabase here.

For the optional LIVE offering checkboxes, apply `supabase/migrations/202610210023_live_requested_offerings.sql` after the account-status migration. It adds private requested-offering data and an explicitly granted intake RPC. The form supports multiple selections from Tarot / oracle reading, Healing, Cleanse, Psychic reading, and Mediumship, shown on each admin entry. Selections do not set a price or change payment verification. Older entries show no selections recorded.

After the donation-intake migration below, apply `supabase/migrations/202610210022_live_account_status.sql` to enable account/guest labels. This additional migration has been tested locally and must also be applied to the hosted database. Google sign-in uses the fixed `/auth/callback` URL with no destination query string. Ensure that exact URL on the site's configured origin is in Supabase's redirect allowlist. A ten-minute HTTP-only cookie preserves the LIVE return destination and is cleared on callback or sign-out. Callback destinations are restricted to known internal pages.

Apply `supabase/migrations/202610120020_tiktok_live_queue.sql` if not already installed, followed by `supabase/migrations/202610210021_live_donation_intake.sql`, before deploying this form. The latter adds the simplified intake RPC, name columns, actual donation amount, and admin-only payment-edit permissions. It preserves older entries. The new migration has been tested locally but has not been applied to a hosted database.

In Supabase, open the project connected to Vercel Production, then SQL Editor → New query. Paste the entire migration file, including `begin;` and `commit;`, and Run. It creates the isolated LIVE queue, submission function, admin permissions, and the TikTok LIVE navigation setting. Do not rerun earlier installed migrations. After success, open `/admin/live` while signed in as the administrator.

The public URL is `https://www.seraphthealchemist.com/tiktok-live`. TikTok LIVE appears in desktop navigation, the mobile header, and the mobile menu. Its visibility can be changed in Admin → Availability & Services → Visible Site Links after the migration.

Verify in the intended hosted environment: submit a test LIVE request with explicit acknowledgments, check it as an admin, compare its amount, mark payment verified, complete/remove/restore it, and add a manual entry. Confirm the scheduling calendar is unchanged. Test external donation destinations separately without assuming that Stripe allows an arbitrary amount.

Run `npm run test:accounts` for SQL permissions, consent, donation totals, duplicate retries, manual entries, queue lifecycle, and calendar isolation; then build and run `npm run test:auth` for the existing authentication regression checks.
