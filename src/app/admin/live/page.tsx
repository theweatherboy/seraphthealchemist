import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';
import { livePayments } from '@/lib/tiktok-live';
import LiveForm from '@/app/tiktok-live/LiveForm';
import { QueueAction, QueueRefresh } from './QueueControls';
import styles from './queue.module.css';

export const dynamic = 'force-dynamic';
const formatDate = (value: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Chicago' }).format(new Date(value));

export default async function LiveQueue({ searchParams }: { searchParams: Promise<{ status?: string; page?: string; error?: string }> }) {
  const { client } = await requireAdmin();
  const params = await searchParams;
  const status = params.status === 'completed' || params.status === 'removed' ? params.status : 'waiting';
  const page = Math.max(1, Math.min(10000, Number.parseInt(params.page ?? '1', 10) || 1));
  const { data, error, count } = await client.from('tiktok_live_queue').select('*', { count: 'exact' }).eq('status', status).order('created_at', { ascending: status === 'waiting' }).range((page - 1) * 50, page * 50 - 1);
  return <section>
    <header className="admin-heading"><p className="eyebrow">TikTok LIVE</p><h1>LIVE queue</h1><p>Compare expected donations with your payment accounts, then complete each reading here. Times are shown in America/Chicago.</p></header>
    <div className={styles.toolbar}><QueueRefresh /><Link href="/tiktok-live" target="_blank">Open visitor page ↗</Link></div>
    <details className={`admin-card ${styles.manual}`}><summary>Add someone manually</summary><p>Enter their name or email, offerings, and payment details after obtaining their policy acknowledgments.</p><LiveForm manual /></details>
    <nav className={styles.tabs} aria-label="LIVE queue status">{['waiting', 'completed', 'removed'].map(value => <Link key={value} href={`/admin/live?status=${value}`} aria-current={status === value ? 'page' : undefined}>{value === 'waiting' ? 'Waiting' : value === 'completed' ? 'Completed' : 'Removed'}</Link>)}</nav>
    {(error || params.error) && <p role="alert" className="admin-notice">{error ? 'The LIVE queue could not be loaded. Verify that the TikTok LIVE migration has been applied, then refresh.' : 'The entry could not be updated. Refresh and try again.'}</p>}
    {!error && <p className="admin-muted">{count ?? 0} {status} · refreshes every 20 seconds</p>}
    <div className={styles.entries}>{(data ?? []).map(entry => {
      const person = entry.name || entry.email || 'LIVE guest';
      return <article key={entry.id} className="admin-card">
        <div className={styles.heading}><div><h2>{person}</h2>{entry.email && entry.name && <p>{entry.email}</p>}<p className="admin-muted"><time dateTime={entry.created_at}>{formatDate(entry.created_at)}</time></p></div><strong className={styles.total}>${entry.expected_amount}<small>Expected donation</small></strong></div>
        <ul className={styles.items}>{entry.items.map(item => <li key={item.id}><span>{item.title}</span><strong>${item.amount}</strong></li>)}</ul>
        <p><strong>{livePayments.find(method => method.id === entry.payment_method)?.name ?? entry.payment_method}</strong> · {entry.payment_status === 'verified' ? 'Payment verified by admin' : 'Needs payment verification'}</p>
        {entry.payment_reference && <p>Payment name / reference: {entry.payment_reference}</p>}
        <p className="admin-muted">{entry.source === 'admin' ? 'Admin-entered; client acknowledgments attested by admin' : 'Visitor confirmed and acknowledged both policies'} · {formatDate(entry.acknowledged_at)}</p>
        <div className={styles.actions}>
          <QueueAction id={entry.id} operation={entry.payment_status === 'verified' ? 'unverified' : 'verified'} label={entry.payment_status === 'verified' ? 'Mark payment unverified' : 'Mark payment verified'} person={person} />
          {entry.status !== 'completed' && <QueueAction id={entry.id} operation="completed" label="Mark completed" person={person} />}
          {entry.status !== 'waiting' && <QueueAction id={entry.id} operation="waiting" label="Return to waiting" person={person} />}
          {entry.status !== 'removed' && <QueueAction id={entry.id} operation="removed" label="Remove from queue" person={person} />}
        </div>
      </article>;
    })}</div>
    {!error && !data?.length && <p className="admin-empty">No {status} LIVE requests on this page.</p>}
    <nav className={styles.toolbar} aria-label="Queue pages">{page > 1 && <Link href={`/admin/live?status=${status}&page=${page - 1}`}>Previous</Link>}{page * 50 < (count ?? 0) && <Link href={`/admin/live?status=${status}&page=${page + 1}`}>Next</Link>}</nav>
  </section>;
}
