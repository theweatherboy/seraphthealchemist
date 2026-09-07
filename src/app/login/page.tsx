import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import SubmitButton from '@/components/auth/SubmitButton';
import { signInWithGoogle } from './actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Sign in | Seraph, The Alchemist', robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; next?: string }> }) {
  const params = await searchParams;
  const configured = !!getSupabaseConfig();
  const client = await createClient();
  if (client) {
    const { data } = await client.auth.getUser();
    if (data.user) redirect(params.next === '/admin' ? '/admin' : '/account');
  }
  return <section className="account-page"><div className="account-panel">
    <p className="eyebrow">Your place in the sanctuary</p>
    <h1>Welcome back</h1>
    <p>Sign in to create or return to your account. Your journey stays with you.</p>
    {params.error && <p role="alert" className="account-notice">We couldn&apos;t complete sign-in. Please try again. If you cancelled at Google, you can start again below.</p>}
    {params.message === 'signed-out' && <p role="status" className="account-notice">You have been signed out on this browser.</p>}
    {configured ? <form action={signInWithGoogle}>
      <SubmitButton pendingLabel="Opening Google…">Continue with Google</SubmitButton>
    </form> : <p role="status" className="account-notice">Account sign-in is coming soon. You can still explore the sanctuary or contact Seraph.</p>}
    <p className="account-fine-print">Your first sign-in creates an account. Your email stays private, and you choose the name used for future public testimonies.</p>
    <div className="account-links"><Link href="/">Return to the sanctuary</Link><Link href="/legal">Privacy &amp; terms</Link></div>
  </div></section>;
}
