import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';
import { localDay, localClock, requestStage, stageClass } from '@/lib/queue';
export const dynamic = 'force-dynamic';
export default async function Calendar({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { client } = await requireAdmin();
  const params=await searchParams;
  const zone='America/Chicago';
  const month=/^20\d{2}-(0[1-9]|1[0-2])$/.test(params.month ?? '') ? params.month! : localDay(new Date().toISOString(),zone).slice(0,7);
  const [year,number]=month.split('-').map(Number);
  const first=new Date(Date.UTC(year,number-1,1));
  const dayCount=new Date(Date.UTC(year,number,0)).getUTCDate();
  const previous=new Date(Date.UTC(year,number-2,1)).toISOString().slice(0,7);
  const next=new Date(Date.UTC(year,number,1)).toISOString().slice(0,7);
  const {data,error}=await client.from('service_requests').select('*').eq('status','scheduled').gte('scheduled_at',new Date(Date.UTC(year,number-1,1)-86400000).toISOString()).lt('scheduled_at',new Date(Date.UTC(year,number,2)).toISOString()).order('scheduled_at');
  return <section><header className="admin-heading"><p className="eyebrow">Make space for your work</p><h1>Calendar</h1><p>Reserved and verified sessions, shown in America/Chicago time.</p></header>{error&&<p role="alert" className="admin-notice">The calendar could not be loaded.</p>}<section className="admin-card calendar-card"><header className="card-heading"><Link href={'?month='+previous} aria-label="Previous month">← Previous</Link><h2>{new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(first)}</h2><Link href={'?month='+next} aria-label="Next month">Next →</Link></header><div className="calendar-scroll"><div className="calendar-grid">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><strong className="calendar-weekday" key={d}>{d}</strong>)}{Array.from({length:first.getUTCDay()},(_,i)=><div className="calendar-day muted" key={'empty'+i}/>)}{Array.from({length:dayCount},(_,i)=>{const day=month+'-'+String(i+1).padStart(2,'0');const sessions=(data??[]).filter(r=>r.scheduled_at&&localDay(r.scheduled_at,zone)===day);return <div className="calendar-day" key={day}><span>{i+1}</span>{sessions.map(r=><Link key={r.id} href={'/admin/scheduling?request='+r.id}><strong>{localClock(r.scheduled_at!,zone)} · {r.service_title}</strong><small className={'admin-badge '+stageClass(r)}>{requestStage(r)}</small></Link>)}</div>;})}</div></div></section></section>;
}
