# Legal pages and Google branding

The public pages are `/privacy-policy` and `/terms-of-service`. The previous `/legal` address permanently redirects to the terms. Both pages are linked from the main navigation. Policy notices are also provided at sign-in, booking, external payment selection, contact, and testimony submission.

Operator confirmed by the owner: **Seraph, The Alchemist, LLC**, Texas, United States. Current privacy/legal contact: **seraphthealchemist@gmail.com**. Do not replace it with `legal@seraphthealchemist.com` until that mailbox can receive messages.

## Google branding values after deploying the website

- Application home page: `https://www.seraphthealchemist.com`
- Privacy policy: `https://www.seraphthealchemist.com/privacy-policy`
- Terms of service: `https://www.seraphthealchemist.com/terms-of-service`

Verify both pages in a signed-out browser on the production domain before submitting their addresses to Google. The pages themselves do not need a migration. The new recording, AI-note, and marketing choices require `supabase/migrations/202609160009_booking_preferences.sql` before deploying the booking changes. Apply it after the previously installed migrations.

## Data inventory used for the draft

- Google/Supabase account identity, email, provider profile metadata, site display name and IDs, timestamps, session cookies.
- Booking contact email, optional phone/alternate contact, selected service, timezone and schedule, notes, payment provider/reference/status, service verification and private administration records.
- Testimony body, rating, revisions, moderation records, and public grouping by account. The site does not automatically publish the Google profile image.
- Contact form name, email, inquiry type, and message sent through FormSubmit to the business inbox.
- Hosting/authentication technical and security logs; optional interface preference storage.
- Payment credentials are entered with external providers; the site does store payment references. Avoid claiming that no payment-related information is stored.

## Drafting choices and remaining customization

The terms use spiritual-service disclaimers, no promised results, an exclusion of specified indirect damages, and a liability cap of the greater of $100 or the price paid for the service giving rise to a claim, subject to applicable law. They preserve non-waivable rights, legitimate payment disputes, and honest reviews. They do not promise complete immunity from liability. A Texas attorney should review enforceability, particularly the liability provisions and notice/acceptance process.

Owner-confirmed policies:

- Adults 18+ only.
- Digital products are nonrefundable, with required legal exceptions.
- Cancellation with at least 24 hours' notice retains payment as credit toward the same session.
- Up to two reschedules per paid booking; each request requires at least 24 hours' notice.
- Late cancellations and no-shows without notice forfeit the payment and service, subject to non-waivable rights.
- Optional Zoom recordings and separate optional Zoom AI Companion notes. Both choices default to off and appear in the admin scheduling queue.
- Marketing emails/texts may be sent only with separate opt-in; the form collects each permission separately. No marketing sending integration has been added. Select a provider and review its consent/unsubscribe requirements before launching campaigns; honor My account withdrawals and any opt-outs received elsewhere.
- No visitor analytics currently configured.

## Zoom operations

The site records client choices; it does not control Zoom or start/stop recording or AI. Before each session, check the booking in Admin -> Scheduling Queue and confirm the client's current preferences.

In Zoom's web portal, review Settings -> AI Companion -> Meeting summary. Disable automatic summary start. Also disable automatic recording and any other automatic AI processing of session content (including in-meeting questions or smart-recording features) unless compatible with the client's separate permissions. Keep summary sharing limited to the host unless the client asks otherwise. Leave the relevant features off for clients who decline. Clients can receive a session without either recording or AI notes.

During a meeting, the host can stop AI summaries from the Zoom AI controls. Stopping does not automatically delete existing notes or recordings; handle deletion requests in Zoom and any retained business copies. Check retention settings rather than assuming Zoom deletes these automatically.

Official Zoom references:

- https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0057960
- https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0058013


## Research references

Comparable businesses were reviewed for topic coverage only; the policy text was drafted for this site's actual functionality, not copied from their contracts:

- https://www.psychicmediumnatasha.com/terms-and-policies
- https://www.marymadiganpsychic.com/terms-and-conditions-psychic-readings

Legal and privacy background:

- https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business
- https://www.ftc.gov/business-guidance/resources/consumer-review-fairness-act-what-businesses-need-know
- https://www.law.cornell.edu/wex/exculpatory_clause
- https://tcss.legis.texas.gov/Docs/bc/htm/bc.17.htm (Texas Business & Commerce Code section 17.42)

These references inform the drafting but are not a legal opinion or assurance that every provision will be enforceable.
