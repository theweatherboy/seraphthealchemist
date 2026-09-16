import type { Metadata } from 'next';
import Link from 'next/link';
import LegalDocument, { type LegalSection } from '@/components/legal/LegalDocument';

export const metadata: Metadata = {
  title: 'Terms of Service | Seraph, The Alchemist',
  description: 'Terms for spiritual services, bookings, external payments, and testimonies at Seraph, The Alchemist.',
  alternates: { canonical: 'https://www.seraphthealchemist.com/terms-of-service' },
};

const sections: LegalSection[] = [
  { id: 'agreement', title: 'About these terms', content: <>
    <p>These terms govern the website at www.seraphthealchemist.com and offerings provided by Seraph, The Alchemist, LLC, based in Texas, United States. “We,” “us,” and “our” mean Seraph, The Alchemist, LLC; “you” means the person using the site or requesting a service.</p>
    <p>Please read these terms before creating an account, submitting a testimony, booking, or paying for a service. By taking an action accompanied by notice that these terms apply, you agree to them. If you do not agree, do not proceed with that action. Our <Link href="/privacy-policy">Privacy Policy</Link> explains how information is handled.</p>
  </> },
  { id: 'spiritual-services', title: 'Nature of spiritual services', content: <>
    <p>Readings, mediumship, cord cutting, energy work, spiritual guidance, and website materials are offered for personal reflection, spiritual exploration, education, and entertainment. They are subjective experiences, not established statements of fact or reliable predictions.</p>
    <p><strong>These offerings are not medical or mental-health treatment, diagnosis, psychotherapy, legal advice, or financial advice.</strong> References to healing, energy, release, or transformation describe spiritual concepts; they do not promise to diagnose, treat, cure, or prevent any condition. Consult an appropriately qualified professional for those matters and do not delay professional care because of a reading or session.</p>
    <p>This is not an emergency or crisis service. Participation is voluntary. You may decline a topic, ask to pause, or end your participation.</p>
  </> },
  { id: 'outcomes', title: 'No promised outcomes & personal decisions', content: <>
    <p>We do not promise a particular message, connection with a specific deceased person, accurate prediction, emotional response, relationship change, financial result, removal of an attachment, or other outcome. Experiences and interpretations vary, and another client’s testimony does not establish what you will experience.</p>
    <p>You remain responsible for your choices and for deciding whether and how to use any information offered. Do not rely on a session as the sole basis for medical, legal, financial, relationship, or other consequential decisions.</p>
  </> },
  { id: 'accounts', title: 'Accounts & respectful use', content: <>
    <p><strong>You must be at least 18 years old to create an account, purchase or book an offering, or participate in a service.</strong> By doing so, you confirm that you meet this requirement. Services are not offered to minors.</p>
    <p>Use your own Google account and provide accurate booking and contact information. Keep your sign-in access secure and contact us if you suspect unauthorized use.</p>
    <p>Do not impersonate others, submit false payment references, attempt to access another person’s records, interfere with the site, or use the service for harassment, threats, or unlawful activity. We may restrict accounts or stop a session when reasonably necessary to address misuse or safety concerns, subject to applicable law and any refund rights.</p>
  </> },
  { id: 'booking-payment', title: 'Bookings & external payments', content: <>
    <p>Prices are stated in US dollars unless specified otherwise. Check the offering, duration, recipient, and amount before paying. A price change applies to future purchases and does not increase the price of a service already agreed and paid for.</p>
    <p>Cash App, PayPal, Venmo, and Stripe process payments on their own websites. Their terms apply to those transactions. This site stores a selected payment method, submitted payment reference, and verification status, but does not collect card numbers, security codes, bank account numbers, or payment-provider passwords.</p>
    <p>Submitting a booking reserves the selected time subject to payment verification and confirmation details from Seraph. An external payment alone does not select an appointment time. Contact us if a payment or scheduling detail is incorrect.</p>
  </> },
  { id: 'refunds', title: 'Cancellations, rescheduling & refunds', content: <>
    <p>Send cancellation and rescheduling requests to <a href="mailto:seraphthealchemist@gmail.com">seraphthealchemist@gmail.com</a>. Notice must reach us at least 24 hours before the scheduled start, measured using the appointment’s stated timezone.</p>
    <ul>
      <li><strong>Cancellation with at least 24 hours’ notice:</strong> your payment stays as credit toward rescheduling the canceled session; it is not returned as a cash refund, except where required by law.</li>
      <li><strong>Rescheduling:</strong> each paid booking may be rescheduled up to two times, subject to availability. Every request must arrive at least 24 hours before the then-current appointment. Using cancellation credit to move that session counts toward this limit.</li>
      <li><strong>Less than 24 hours’ notice:</strong> cancellation or a request to move the appointment does not qualify for a refund, credit, or reschedule. If you do not attend at the agreed time, the booking is canceled and the payment and session are forfeited, except where required by law.</li>
      <li><strong>After two reschedules:</strong> no further transfer is included. You must attend the agreed appointment or forfeit the session and payment, subject to non-waivable legal rights.</li>
    </ul>
    <p><strong>Digital product purchases are final sale and nonrefundable because of their digital nature, except where applicable law requires otherwise.</strong> Completed sessions are also nonrefundable unless required by law or we agree in writing. A subjective experience or an outcome different from what you hoped for does not by itself create a refund entitlement.</p>
    <p><strong>A no-show without notice is an automatic cancellation. You forfeit the payment and the session, subject to any rights that cannot legally be waived.</strong> Contact us before the scheduled start if you cannot attend; contacting us after a missed appointment does not count as advance notice.</p>
    <p>If we cannot provide a paid service, we will offer a replacement appointment or refund for the undelivered service. Nothing in these terms removes non-waivable refund rights or the right to raise a legitimate payment dispute.</p>
  </> },
  { id: 'testimonies', title: 'Testimonies & public submissions', content: <>
    <p>Share only your own honest experience. A confirmed historical service makes a testimony eligible for submission; it is not an endorsement of a particular result. A verified testimony label means Seraph confirmed the service record, not that an independent payment auditor verified it.</p>
    <p>You keep ownership of your words. By submitting a testimony for publication, you give us a nonexclusive, royalty-free permission to host and display it on this website with your chosen public name, rating, and service title. This permission does not authorize unrelated advertising use. You can request removal by email.</p>
    <p>We may moderate spam, impersonation, unlawful content, threats, or private information. We do not require favorable feedback, and these terms do not restrict honest reviews or impose penalties for criticism. Public testimonies from one account are grouped together, as explained in the <Link href="/privacy-policy#public-testimonies">Privacy Policy</Link>.</p>
  </> },
  { id: 'content-recordings', title: 'Content & recordings', content: <>
    <p>Original website materials and branding belong to their respective owners. You may use material provided to you for personal, noncommercial purposes. Do not resell, republish, or commercially distribute it without permission, except as permitted by law. This does not transfer ownership of your own testimony to us.</p>
    <p>Zoom audio/video recording and Zoom AI Companion notes require separate permission. You can decline either and still receive a session, and may ask Seraph to stop either before or during the session. AI-generated notes can be inaccurate and are not medical or other professional records. See the <Link href="/privacy-policy#session-records">session privacy details</Link>.</p>
    <p>Recording or sharing a private session requires the participants’ prior agreement and compliance with applicable law. Do not publish another person’s private session information without permission.</p>
  </> },
  { id: 'warranties', title: 'Disclaimer of warranties', content: <>
    <p><strong>To the maximum extent permitted by applicable law, the website, content, and spiritual services are provided “as is” and “as available,” without warranties of accuracy, uninterrupted availability, merchantability, fitness for a particular purpose, or noninfringement.</strong></p>
    <p>We cannot guarantee that external websites or service providers will remain available or error-free. These disclaimers do not override express commitments made for a booking or warranties and consumer protections that cannot lawfully be excluded.</p>
  </> },
  { id: 'liability', title: 'Limitation of liability', content: <>
    <p><strong>To the maximum extent permitted by applicable law, Seraph, The Alchemist, LLC and its members, managers, employees, and representatives are not liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or loss of profits, opportunities, goodwill, or data arising from use of the site or services.</strong></p>
    <p><strong>To the extent a limitation is permitted by law, our total liability for claims arising from a particular service or use of the website will not exceed the greater of US $100 or the amount you paid us for the service giving rise to the claim.</strong></p>
    <p>These limits apply regardless of the legal theory asserted and only to the extent enforceable in your jurisdiction. They do not exclude or limit liability for fraud, intentional misconduct, gross negligence, or any other liability that applicable law does not allow us to exclude or limit. They do not remove a refund expressly owed under these terms or non-waivable consumer rights.</p>
  </> },
  { id: 'disputes-changes', title: 'Questions, disputes & changes', content: <>
    <p>For questions or concerns, contact <a href="mailto:seraphthealchemist@gmail.com">seraphthealchemist@gmail.com</a> with enough detail for us to investigate. Contacting us does not waive any right to contact a regulator, payment provider, or court.</p>
    <p>These terms are governed by Texas law and applicable United States federal law, without regard to conflict-of-law rules. Mandatory protections and rights to bring a claim in a particular forum under the laws applicable to you remain in effect. Nothing here is a waiver of rights under the Texas Deceptive Trade Practices–Consumer Protection Act that cannot lawfully be waived.</p>
    <p>If a provision is unenforceable, the remaining provisions continue to apply to the extent permitted by law. Applicable mandatory consumer protections remain in effect.</p>
    <p>We may revise these terms for future use and bookings and will update the date on this page. Changes do not retroactively alter agreed terms for an existing purchase without your agreement or a legal requirement.</p>
  </> },
];

export default function TermsOfServicePage() {
  return <LegalDocument title="Terms of Service" introduction="Clear expectations for spiritual services, accounts, bookings, and sharing your experience." sections={sections} />;
}
