import 'server-only';

export function getSupabaseConfig() {
  // Prefer the server variables also supplied by the Vercel integration.
  // NEXT_PUBLIC fallbacks are supported, but Next.js embeds those at build time.
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(parsed.hostname)) return null;
    // Only a publishable key belongs here. Never accept a privileged secret.
    if (!key.startsWith('sb_publishable_')) return null;
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
