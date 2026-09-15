import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';
export const dynamic = 'force-dynamic';
export default async function Clients({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { client } = await requireAdmin();
  const [params, profiles, requests] = await Promise.all([searchParams, client.from('profiles').select('id, display_name, created_at').order('display_name'), client.from('service_requests').select('id, customer_id, contact_email, service_title, created_at').order('created_at', { ascending: false })]);
  const q=(params.q ?? '').toLowerCase();
  const rows=(profiles.data ?? []).map(p=>({...p,requests:(requests.data ?? []).filter(r=>r.customer_id===p.id)})).filter(p=>(p.display_name+' '+(p.requests[0]?.contact_email ?? '')).toLowerCase().includes(q));
  return <section><header className="admin-heading"><p className="eyebrow">People of the sanctuary</p><h1>Clients</h1><p>Your members and the sessions they have requested.</p></header>{(profiles.error||requests.error)&&<p role="alert" className="admin-notice">Client information could not be fully loaded.</p>}<form className="admin-search-form"><input name="q" aria-label="Search clients" defaultValue={params.q} placeholder="Search name or booking email…" /><button type="submit">Search</button></form><div className="client-grid">{rows.map(p=><article className="admin-card" key={p.id}><h2>{p.display_name}</h2><p className="admin-muted">{p.requests[0]?.contact_email ?? 'No booking email yet'}</p><p>{p.requests.length} service requests</p>{p.requests.slice(0,3).map(r=><Link className="dashboard-row" key={r.id} href={'/admin/scheduling?request='+r.id}>{r.service_title} →</Link>)}</article>)}</div>{!rows.length&&<p className="admin-empty">No members match this search.</p>}</section>;
}
