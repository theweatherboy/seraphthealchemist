import Link from 'next/link';
import { CalendarDays, CreditCard, MessageSquare, Users, ArrowUpRight } from 'lucide-react';
import { requireAdmin } from '@/lib/admin';
import { formatTime, requestStage, stageClass } from '@/lib/queue';

export const dynamic = 'force-dynamic';
export default async function Dashboard() {
  const { client } = await requireAdmin();
  const [requests, reviews, profiles] = await Promise.all([
    client.from('service_requests').select('*').order('created_at', { ascending: false }),
    client.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    client.from('profiles').select('id', { count: 'exact', head: true }),
  ]);
  const rows = requests.data ?? [];
  const now = new Date().getTime();
  const upcoming = rows.filter(r => r.status === 'scheduled' && r.scheduled_at && Date.parse(r.scheduled_at) >= now).sort((a,b) => (a.scheduled_at ?? '').localeCompare(b.scheduled_at ?? ''));
  const needs = rows.filter(r => requestStage(r) === 'Needs Verification').length;
  const cards = [
    { label: 'Awaiting verification', value: needs, href: '/admin/scheduling?filter=Needs%20Verification', Icon: CreditCard },
    { label: 'Upcoming sessions', value: upcoming.length, href: '/admin/calendar', Icon: CalendarDays },
    { label: 'Testimonies to review', value: reviews.count ?? 0, href: '/admin/testimonies', Icon: MessageSquare },
    { label: 'Sanctuary members', value: profiles.count ?? 0, href: '/admin/clients', Icon: Users },
  ];
  return <section><header className="admin-heading"><p className="eyebrow">Your sanctuary, at a glance</p><h1>Welcome, Seraph</h1><p>A little clarity for the day ahead. Your sessions, clients, and next steps.</p></header>
    {(requests.error || reviews.error || profiles.error) && <p role="alert" className="admin-notice">Some dashboard information could not be loaded. Please refresh to try again.</p>}
    <div className="admin-stats">{cards.map(({ label, value, href, Icon }) => <Link className="admin-card stat-card" href={href} key={label}><Icon size={23} /><strong>{value}</strong><span>{label}</span><ArrowUpRight size={16} /></Link>)}</div>
    <div className="dashboard-grid"><section className="admin-card"><div className="card-heading"><h2>Coming into alignment</h2><Link href="/admin/calendar">View calendar →</Link></div><p className="admin-muted">Your next reserved sessions</p>{upcoming.length ? upcoming.slice(0,5).map(r => <Link className="dashboard-row" href={'/admin/scheduling?request='+r.id} key={r.id}><span><strong>{r.service_title}</strong><small>{r.contact_email}</small><small>{formatTime(r.scheduled_at,r.timezone)} · {r.timezone}</small></span><span className={'admin-badge '+stageClass(r)}>{requestStage(r)}</span></Link>) : <p className="admin-empty">No upcoming sessions. New reservations will appear here.</p>}</section>
    <section className="admin-card"><div className="card-heading"><h2>Your next steps</h2></div><Link className="dashboard-task" href="/admin/scheduling?filter=Needs%20Verification"><CreditCard /><span><strong>Review payments</strong><small>{needs ? needs+' reservations need your attention.' : 'You are all caught up.'}</small></span><ArrowUpRight /></Link><Link className="dashboard-task" href="/admin/services"><CalendarDays /><span><strong>Set your availability</strong><small>Manage weekly hours, time off, and service limits.</small></span><ArrowUpRight /></Link><Link className="dashboard-task" href="/admin/testimonies"><MessageSquare /><span><strong>Review testimonies</strong><small>Confirm sessions and publish client experiences.</small></span><ArrowUpRight /></Link><blockquote>“Right timing creates the space for miracles.”</blockquote></section></div>
    <section className="admin-card"><div className="card-heading"><h2>Recent requests</h2><Link href="/admin/scheduling">Open queue →</Link></div>{rows.slice(0,4).map(r => <Link className="dashboard-row" key={r.id} href={'/admin/scheduling?request='+r.id}><span><strong>{r.service_title}</strong><small>{r.contact_email}</small></span><span className={'admin-badge '+stageClass(r)}>{requestStage(r)}</span></Link>)}{!rows.length && <p className="admin-empty">Your first request will appear here when a client reserves a session.</p>}</section>
  </section>;
}
