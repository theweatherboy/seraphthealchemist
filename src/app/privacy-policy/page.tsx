import type { Metadata } from 'next';
import Link from 'next/link';
import LegalDocument, { type LegalSection } from '@/components/legal/LegalDocument';

export const metadata: Metadata = {
  title: 'Privacy Policy | Seraph, The Alchemist',
  description: 'How Seraph, The Alchemist handles account information, bookings, contact messages, and public testimonies.',
  alternates: { canonical: 'https://www.seraphthealchemist.com/privacy-policy' },
};

const sections: LegalSection[] = [
  { id: 'who-we-are', title: 'Who we are & how to contact us', content: <>
    <p>This policy covers the website and services offered by Seraph, The Alchemist, LLC, based in Texas, United States, at www.seraphthealchemist.com. In this policy, “we,” “us,” and “our” refer to Seraph, The Alchemist, LLC.</p>
    <p>For privacy questions or requests concerning your information, email <a href="mailto:seraphthealchemist@gmail.com">seraphthealchemist@gmail.com</a>. Our <Link href="/terms-of-service">Terms of Service</Link> describe the conditions for using our offerings.</p>
  </> },
  { id: 'information', title: 'Information we collect', content: <>
    <ul>
      <li><strong>Account information.</strong> Signing in with Google supplies your email address, a Google account identifier, and basic profile information made available by Google, which may include your name and profile image. Supabase handles authentication. We also store your site account ID, chosen display name, public profile ID, and account timestamps. We do not receive your Google password.</li>
      <li><strong>Booking and service information.</strong> We store the service you request, appointment times and timezone, your contact email, an optional phone number or alternate contact, notes you submit, booking status, and service completion records. We may keep private administrative notes to manage your request.</li>
      <li><strong>Payment references.</strong> We store your chosen payment provider, the reference or username you submit, and payment verification status. <strong>This website does not collect or store payment card numbers, card security codes, bank account numbers, or payment-provider passwords.</strong> Payment takes place on an external provider’s website.</li>
      <li><strong>Messages.</strong> If you contact us, we receive the name, email address, inquiry type, message, and any other information you choose to share. The website contact form is processed by FormSubmit and delivered to our email inbox.</li>
      <li><strong>Testimonies.</strong> We store your submitted text, rating, associated service, submission dates, revisions, and moderation records.</li>
      <li><strong>Session records and preferences.</strong> We store your choices about Zoom recording, Zoom AI Companion notes, and marketing email or texts, along with when and under which notice version those choices were submitted. Opted-in recordings and AI notes are handled as described below.</li>
      <li><strong>Technical information.</strong> Hosting and authentication services may process IP addresses, browser or device information, request times, and security or error logs when you use the site.</li>
    </ul>
    <p>Please do not include payment credentials, government identification numbers, detailed medical records, or another person’s private information in messages, booking notes, or testimonies.</p>
  </> },
  { id: 'use', title: 'How we use information', content: <>
    <p>We use information to create and secure accounts; schedule and deliver services; communicate about appointments and inquiries; match payments to bookings; confirm past services; moderate and display submitted testimonies; troubleshoot problems; prevent misuse; and address legal obligations and disputes.</p>
    <p>Providing a phone number is optional. Account or booking contact details are used for service communications; submitting them does not by itself enroll you in marketing emails or texts.</p>
  </> },
  { id: 'public-testimonies', title: 'What becomes public', content: <>
    <p>Submitting a testimony asks us to review it for public display. If published, visitors can see your chosen display name, testimony, rating, service title, and associated review information. Testimonies from the same account are grouped using an account identifier, which connects those experiences publicly.</p>
    <p>Your email, phone number, payment reference, and private booking or moderation notes are not included in the public testimony display. Information you put in the testimony itself can become public, so review it before submitting. Your Google profile photo is not automatically displayed with testimonies.</p>
    <p>You may request removal of a testimony by emailing us. Public content may be copied by other people or indexed by search engines; removing it from our site cannot erase copies held by others.</p>
  </> },
  { id: 'session-records', title: 'Optional Zoom recordings & AI notes', content: <>
    <p>We conduct online sessions through Zoom. With your separate permission, we may record session audio and video, or use Zoom AI Companion to generate and retain session notes. AI summaries process speech-to-text data even when you have not requested an audio/video recording.</p>
    <p>Recording and AI notes are separate, optional choices. Neither is required to receive a session. You may decline either at booking or ask Seraph to stop it before or during the session. Stopping processing does not automatically erase material already created; contact us about deletion.</p>
    <p>Recordings and AI notes support your session and follow-up and are not public testimonies. They may contain sensitive details you choose to discuss. Zoom processes this material through its meeting and AI services; records may be retained in our Zoom account or business records. AI notes can contain errors. They are not clinical records or professional advice.</p>
  </> },
  { id: 'marketing', title: 'Optional marketing messages', content: <>
    <p>We may send marketing emails or texts when you separately opt in. The booking form provides independent, unchecked choices for email and text messages. A service purchase, a phone number, or permission to record does not by itself authorize marketing.</p>
    <p>You may withdraw marketing permission in My account or by emailing <a href="mailto:seraphthealchemist@gmail.com">seraphthealchemist@gmail.com</a>. You may also use an unsubscribe or opt-out method provided with a message. Withdrawing marketing permission does not stop necessary appointment, account, or payment communications. Message frequency varies; mobile carrier message and data rates may apply.</p>
    <p>We do not sell information collected through this website or share it for cross-context behavioral advertising. Marketing consent and phone numbers are not provided to third parties for their own marketing.</p>
  </> },
  { id: 'providers', title: 'Service providers & disclosures', content: <>
    <p>We use other companies to operate the site and communicate with you. They process information necessary for their roles:</p>
    <ul>
      <li><strong>Google and Supabase:</strong> sign-in, account authentication, and database services.</li>
      <li><strong>Vercel:</strong> website hosting and delivery.</li>
      <li><strong>FormSubmit and our email provider:</strong> contact-form processing and correspondence.</li>
      <li><strong>Zoom, including Zoom AI Companion:</strong> online sessions, optional recordings, and optional AI-generated notes.</li>
      <li><strong>Cash App, PayPal, Venmo, or Stripe:</strong> payments you make through their external websites. They may supply us with transaction information such as the payer’s name, amount, date, and payment status through their own services.</li>
    </ul>
    <p>External providers handle information under their own terms and privacy policies. We may also disclose information when reasonably necessary to comply with law, respond to valid legal process, protect people or the service, or resolve a dispute. We do not publish private account data as part of your testimony.</p>
  </> },
  { id: 'cookies', title: 'Cookies & browser storage', content: <>
    <p>We do not currently use visitor analytics or advertising trackers on this website. Necessary hosting and security logs are separate from visitor analytics.</p>
    <p>The site uses cookies to establish and maintain your sign-in session and protect the login process. Browser storage may also remember interface preferences, such as whether an introduction has been shown. Blocking or clearing authentication cookies can prevent sign-in or sign you out.</p>
    <p>Google and payment-provider pages may use their own cookies when you visit them. Their controls and policies apply on those pages.</p>
  </> },
  { id: 'retention-security', title: 'Retention, security & processing locations', content: <>
    <p>We keep information for as long as reasonably needed to maintain your account, provide services, handle payment reconciliation or disputes, and meet applicable recordkeeping obligations. Public testimonies may remain until removed. Retention depends on the type of record and why it is needed; we do not promise automatic deletion after a fixed number of days.</p>
    <p>Access controls and authenticated sessions help protect private account and booking information. No website, transmission method, or storage system can guarantee absolute security. Service providers may process information in the United States or other countries where they operate.</p>
  </> },
  { id: 'choices', title: 'Your choices & privacy requests', content: <>
    <p>You can update your public display name in My account, leave optional phone and note fields blank, and choose not to submit a public testimony. You can email us to request access to, correction of, or deletion of your information, or removal of a published testimony.</p>
    <p>We may ask for reasonable information to verify a request and protect your account. Depending on applicable law, some records may need to be retained for legal obligations, security, or unresolved disputes. Deletion from active systems may not immediately remove copies in provider backups.</p>
    <p>Additional privacy rights may apply where you live. We will respond to requests as required by applicable law. Where available, you may also contact your local privacy regulator. You can revoke the site’s Google connection through your Google account settings; doing so does not automatically delete records already held by this site.</p>
  </> },
  { id: 'age', title: 'Adults only', content: <>
    <p>Accounts, purchases, and services are limited to adults aged 18 and older. We do not knowingly collect personal information from minors. If you believe a minor has provided information, contact us so we can investigate and remove it as appropriate, subject to applicable legal obligations.</p>
  </> },
  { id: 'updates', title: 'Changes to this policy', content: <>
    <p>We will update this page and its date when our practices change. Where legally required, we will provide additional notice or obtain consent before using information in a materially different way.</p>
  </> },
];

export default function PrivacyPolicyPage() {
  return <LegalDocument title="Privacy Policy" introduction="Understand what you share, what stays private, and what appears when you publish a testimony." sections={sections} />;
}
