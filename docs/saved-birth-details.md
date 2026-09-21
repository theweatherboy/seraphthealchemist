# Optional account birth profiles

Apply `supabase/migrations/202609200012_birth_profiles.sql` once in the development Supabase SQL Editor, after the existing account setup. Apply the same migration to the deployment's database before enabling the feature there. This adds a new table only; it does not import or save existing visitors' details. No service-role key is required by the application.

The birth-chart page has a separate unchecked consent checkbox and Save button for authenticated users. Saving is independent of chart calculation. One profile is kept per account. Later changes are not automatically saved. Returning users select Use saved details, then Reveal my chart to calculate a fresh year and supply chart context to the existing assistant. There is no automatic chart-provider or AI request on restoration.

The profile includes the date, local clock time, selected place label, latitude, longitude, derived IANA timezone, consent version, and timestamps. The authenticated user ID is set by the server. The API checks the current session, same-origin mutation requests, and a matching account ID to reject stale cross-account requests. It validates dates, clock times, coordinates, and explicit consent. RLS separately restricts every operation to the owning user. No public or application-admin policy exposes the table. Auth-account deletion cascades to the saved row.

GET/PUT/DELETE `/api/birth-chart/profile` responses are private and not cached. Birth profiles are never placed in browser localStorage, public profiles, navigation payloads, or chat persistence. The assistant still receives the existing filtered calculated context, not raw birth identifiers.

Delete saved details deletes the active database row and clears the current form, chart, and assistant. Loading another profile and changing signed-in accounts also reset page context. In-flight chart/city requests are cancelled so they cannot reintroduce an old chart after deletion. Infrastructure backups and earlier provider logs are subject to their separate retention policies.

The account page links to these controls. If the table is not installed or is unavailable, the page reports that saving is unavailable and still allows unsaved chart calculations. Local migration tests cover cross-account reads/writes, consent enforcement, anonymous access, deletion, and account-deletion cascade. Actual hosted save/restore needs the migration plus an authenticated session.
