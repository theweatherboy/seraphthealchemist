import 'server-only';

export function getSupabaseConfig() {
  // Prefer the server variables also supplied by the Vercel integration.
  // NEXT_PUBLIC fallbacks are supported, but Next.js embeds those at build time.
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(parsed.hostname)) return null;
    // Only a publishable key belongs here. Never accept a privileged secret.
    // Supabase projects may expose either the newer sb_publishable key or the
    // legacy JWT-shaped anon key. Both are public client keys; secret/service
    // role keys are rejected because they do not match either format.
    if (!key.startsWith('sb_publishable_') && !key.startsWith('eyJ')) return null;
    return { url: parsed.origin, key };
  } catch {
    return null;
  }
}

export function getSiteOrigin() {
  const configured = process.env.SITE_URL;
  if (configured) return new URL(configured).origin;
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.VERCEL) return 'https://www.seraphthealchemist.com';
  return 'http://localhost:3000';
}
