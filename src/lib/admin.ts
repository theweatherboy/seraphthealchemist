import 'server-only';
import { notFound } from 'next/navigation';
import { requireAccount } from '@/lib/supabase/session';

export async function requireAdmin() {
  const session = await requireAccount('/admin');
  const { data, error } = await session.client.from('admin_memberships').select('user_id').eq('user_id', session.user.id).maybeSingle();
  if (error || !data) notFound();
  return session;
}
