# TikTok LIVE queue

Updated October 21, 2026. Public page: `/tiktok-live`. Admin queue: `/admin/live`.

Visitors first choose Continue with Google (sign-in or account creation) or Continue as guest. Already signed-in visitors proceed directly to the form. Google returns to `/tiktok-live`; failed sign-in preserves that destination and offers a way back to guest access. The database records account/guest status from the authenticated session and links signed-in entries to the account ID. Manual entries are labeled separately; older entries show status not recorded. These details remain admin-only.

Visitors enter first and last name and accept the Terms of Service and Privacy Policy. Payment-method buttons appear once those fields are complete. Choosing a method submits the queue entry; its donation link appears only after the server saves successfully. No account, offering selection, email, payment reference, or claim of prior payment is required.

Only explicit payment-method submission writes a queue entry. The server and database reject missing acknowledgments and invalid names or methods. Request UUIDs make retries idempotent, including after an admin corrects payment details. Public intake has a per-name burst limit; it is not identity verification or comprehensive bot protection.

Queue entries are private to administrators. New entries store first and last name, the selected method, policy timestamp/versions, and visitor/admin source. The actual donated amount starts unset and payment starts unverified. Older entries retain their offering snapshots and expected totals. No automatic payment verification occurs.

Administrators can edit the donated amount (including cents) and payment method, then use Confirm payment to save and verify together. Save as unverified saves corrections for later checking. They can also complete, remove, or restore entries. Removal archives the acknowledgment history. Manual entry requires policy acknowledgments and records the administrator's user ID. The queue refreshes every 20 seconds, pausing while a form has focus, and has pagination.

LIVE data lives only in `tiktok_live_queue`. It does not insert/update `service_requests`, availability, blocks, calendars, or testimony eligibility. Standard multiple-service scheduled booking remains deferred.

## Deployment

After the donation-intake migration below, apply `supabase/migrations/202610210022_live_account_status.sql` to enable account/guest labels. This additional migration has been tested locally and must also be applied to the hosted database. The application uses the existing Google OAuth configuration and callback URL; allow the callback with `?next=/tiktok-live` in Supabase redirect settings if the current allowlist does not cover it.

Apply `supabase/migrations/202610120020_tiktok_live_queue.sql` if not already installed, followed by `supabase/migrations/202610210021_live_donation_intake.sql`, before deploying this form. The latter adds the simplified intake RPC, name columns, actual donation amount, and admin-only payment-edit permissions. It preserves older entries. The new migration has been tested locally but has not been applied to a hosted database.

In Supabase, open the project connected to Vercel Production, then SQL Editor → New query. Paste the entire migration file, including `begin;` and `commit;`, and Run. It creates the isolated LIVE queue, submission function, admin permissions, and the TikTok LIVE navigation setting. Do not rerun earlier installed migrations. After success, open `/admin/live` while signed in as the administrator.

The public URL is `https://www.seraphthealchemist.com/tiktok-live`. TikTok LIVE appears in desktop navigation, the mobile header, and the mobile menu. Its visibility can be changed in Admin → Availability & Services → Visible Site Links after the migration.

Verify in the intended hosted environment: submit a test LIVE request with explicit acknowledgments, check it as an admin, compare its amount, mark payment verified, complete/remove/restore it, and add a manual entry. Confirm the scheduling calendar is unchanged. Test external donation destinations separately without assuming that Stripe allows an arbitrary amount.

Run `npm run test:accounts` for SQL permissions, consent, donation totals, duplicate retries, manual entries, queue lifecycle, and calendar isolation; then build and run `npm run test:auth` for the existing authentication regression checks.
