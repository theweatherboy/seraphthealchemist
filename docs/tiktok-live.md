# TikTok LIVE queue

Implemented October 12, 2026. Public page: `/tiktok-live`. Admin queue: `/admin/live`.

Visitors select one or more LIVE offerings and optionally the $11 guidance extension, enter a name/TikTok handle or email, choose a payment provider, and donate externally. They must check both linked policy acknowledgments and confirm their details/donation before submitting. No account is required. Payment links open separately so the form remains available.

Only explicit submission writes a queue entry. Selection, payment-link clicks, and policy-link clicks do not write data. The server and database reject missing acknowledgments; the database computes offering snapshots and expected donation totals. A client request UUID makes same-payload retries idempotent. Public intake has a per-contact burst limit; it is not identity verification or comprehensive bot protection.

Queue entries are private to administrators. Each entry stores its submission date, name/email, selected offerings and prices, payment method/reference, expected donation, payment status, policy acknowledgment timestamp/versions, and whether it was submitted by a visitor or entered by an administrator. Submitted names/emails and donation confirmation are self-reported. No automatic payment verification occurs.

Administrators can verify payment, complete entries, remove entries, or restore them to Waiting. Removal archives an entry under Removed rather than deleting its acknowledgment history. The manual form requires the administrator to attest that the person acknowledged both policies. It records the administrator's user ID. Completed and removed entries remain accessible in their own views. The queue refreshes every 20 seconds and has pagination.

LIVE data lives only in `tiktok_live_queue`. It does not insert/update `service_requests`, availability, blocks, calendars, or testimony eligibility. Standard multiple-service scheduled booking remains deferred.

## Deployment

Apply `supabase/migrations/202610120020_tiktok_live_queue.sql` once to the intended database after its earlier migrations, then deploy the application. No service-role key or new provider account is needed. This migration has not been applied to a hosted database by this implementation.

In Supabase, open the project connected to Vercel Production, then SQL Editor → New query. Paste the entire migration file, including `begin;` and `commit;`, and Run. It creates the isolated LIVE queue, submission function, admin permissions, and the TikTok LIVE navigation setting. Do not rerun earlier installed migrations. After success, open `/admin/live` while signed in as the administrator.

The public URL is `https://www.seraphthealchemist.com/tiktok-live`. TikTok LIVE appears in desktop navigation, the mobile header, and the mobile menu. Its visibility can be changed in Admin → Availability & Services → Visible Site Links after the migration.

Verify in the intended hosted environment: submit a test LIVE request with explicit acknowledgments, check it as an admin, compare its amount, mark payment verified, complete/remove/restore it, and add a manual entry. Confirm the scheduling calendar is unchanged. Test external donation destinations separately without assuming that Stripe allows an arbitrary amount.

Run `npm run test:accounts` for SQL permissions, consent, donation totals, duplicate retries, manual entries, queue lifecycle, and calendar isolation; then build and run `npm run test:auth` for the existing authentication regression checks.
