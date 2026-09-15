import { requireAdmin } from '@/lib/admin';
import Queue from '@/components/admin/Queue';
export const dynamic = 'force-dynamic';
export default async function SchedulingPage({ searchParams }: { searchParams: Promise<{ request?: string; filter?: string; error?: string; saved?: string }> }) {
  const { client } = await requireAdmin();
  const [params, requests, profiles] = await Promise.all([searchParams, client.from('service_requests').select('*').order('created_at', { ascending: false }), client.from('profiles').select('id, display_name')]);
  const names = new Map((profiles.data ?? []).map(p => [p.id, p.display_name]));
  return <Queue requests={(requests.data ?? []).map(r => ({ ...r, client_name: names.get(r.customer_id) ?? r.contact_email ?? 'Sanctuary client' }))} initialRequest={params.request} initialFilter={params.filter} error={!!requests.error || !!params.error} saved={!!params.saved} />;
}
