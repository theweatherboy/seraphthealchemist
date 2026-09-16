'use client';

import { useState } from 'react';
import { Search, Mail, CalendarDays, CreditCard, FileText, X, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { updateServiceRequest } from '@/app/admin/actions';
import SubmitButton from '@/components/auth/SubmitButton';
import { filters, requestStage, stageClass, formatTime, localDay, localClock, paymentName, type QueueRequest } from '@/lib/queue';

const initials = (name: string) => name.split(/\s+/).slice(0,2).map(n => n[0]).join('').toUpperCase();
const tabs = ['Overview', 'Client Info', 'Payment', 'Notes'] as const;

function SavedFields({ request }: { request: QueueRequest }) {
  return <><input type="hidden" name="request_id" value={request.id} /><input type="hidden" name="return_to" value={'/admin/scheduling?request='+request.id} /><input type="hidden" name="status" value={request.status} /><input type="hidden" name="scheduled_date" value={request.scheduled_at ? localDay(request.scheduled_at,request.timezone) : ''} /><input type="hidden" name="scheduled_time" value={request.scheduled_at ? localClock(request.scheduled_at,request.timezone) : ''} /><input type="hidden" name="timezone" value={request.timezone} /><input type="hidden" name="admin_note" value={request.admin_note ?? ''} /></>;
}

function Detail({ request }: { request: QueueRequest }) {
  const [tab, setTab] = useState<typeof tabs[number]>('Overview');
  const [edit, setEdit] = useState(false);
  const stage = requestStage(request);
  return <>
    <div className="request-person"><span className="admin-avatar large">{initials(request.client_name)}</span><div><h2>{request.client_name}</h2><p>{request.service_title}</p></div></div>
    <div className="detail-tabs" role="tablist" aria-label="Reservation details">{tabs.map(t => <button type="button" role="tab" id={'tab-'+t.replace(' ','')} aria-controls="request-tab-panel" aria-selected={tab===t} key={t} onClick={() => setTab(t)}>{t}</button>)}</div>
    <div className="detail-info" role="tabpanel" id="request-tab-panel" aria-labelledby={'tab-'+tab.replace(' ','')}>
      {(tab==='Overview'||tab==='Client Info') && <><p><Mail /><span>{request.contact_email ?? 'No email available'}</span></p>{tab==='Client Info' && <p><span>Phone: {request.contact_phone ?? 'Not provided'}</span></p>}</>}
      {tab==='Overview' && <><p><CalendarDays /><span>Reserved: {formatTime(request.scheduled_at,request.timezone)}<small>{request.timezone}</small></span></p><p><FileText /><span>Requested: {formatTime(request.created_at,request.timezone)}</span></p></>}
      {(tab==='Overview'||tab==='Payment') && <><p><AlertCircle /><span>Payment status: <strong className={request.payment_status==='verified'?'text-verified':'text-needs'}>{request.payment_status.replaceAll('_',' ')}</strong></span></p><p><CreditCard /><span>Payment method: {paymentName(request.payment_method)}</span></p><p><FileText /><span>Reference: {request.payment_reference}</span></p></>}
      {(tab==='Overview'||tab==='Client Info') && <p><span>Zoom recording: <strong>{request.recording_opt_in ? 'Client opted in; confirm before recording' : 'No recording consent'}</strong></span></p>}
      {(tab==='Overview'||tab==='Client Info') && <p><span>Zoom AI notes: <strong>{request.ai_notes_opt_in ? 'Client opted in' : 'Keep AI Companion off'}</strong></span></p>}
      {tab==='Client Info' && <><p><span>Marketing email: {request.marketing_email_opt_in ? 'Opted in' : 'Not opted in'}</span></p><p><span>Marketing texts: {request.marketing_sms_opt_in ? 'Opted in' : 'Not opted in'}</span></p><p><span>Preferences submitted: {request.preferences_recorded_at ? formatTime(request.preferences_recorded_at, request.timezone) : 'No consent recorded'}<small>Check current preferences and any later opt-out before contacting the client.</small></span></p></>}
      {tab==='Notes' && <><h3>Client note</h3><p className="note-content">{request.note ?? 'No client note.'}</p><h3>Private admin note</h3><p className="note-content">{request.admin_note ?? 'No internal note yet.'}</p></>}
    </div>
    <div className={'verification-card '+(stage==='Needs Verification'?'attention':'')}>
      <div><CheckCircle2 /><span><strong>{stage==='Needs Verification'?'Payment verification needed':stage}</strong><small>{stage==='Needs Verification'?'Check the payment reference with your provider before verifying.':stage==='Scheduled'?'Payment verified. This appointment is on your schedule.':'Review or update the reservation below.'}</small></span></div>
      {stage==='Needs Verification' && <form action={updateServiceRequest}><SavedFields request={request} /><input type="hidden" name="payment_status" value="verified" /><SubmitButton pendingLabel="Verifying…">Verify payment</SubmitButton></form>}
      {request.contact_email && <a className="admin-outline" href={'mailto:'+request.contact_email+'?subject='+encodeURIComponent('Your '+request.service_title+' session')}>Contact client</a>}
    </div>
    <div className="detail-actions"><h3>Manage reservation</h3><button className="admin-outline" type="button" aria-expanded={edit} onClick={() => setEdit(!edit)}>{edit?'Close editor':'Edit time, status & notes'}</button></div>
    {edit && <form action={updateServiceRequest} className="admin-edit-form">
      <input type="hidden" name="request_id" value={request.id} /><input type="hidden" name="return_to" value={'/admin/scheduling?request='+request.id} />
      <label>Payment status<select name="payment_status" defaultValue={request.payment_status}><option value="awaiting_verification">Awaiting verification</option><option value="verified">Verified</option><option value="declined">Declined</option><option value="refunded">Refunded</option></select></label>
      <label>Appointment status<select name="status" defaultValue={request.status}><option value="pending">Pending</option><option value="contacted">Contacted</option><option value="scheduled">Reserved / scheduled</option><option value="completed">Completed</option><option value="canceled">Canceled</option><option value="declined">Declined</option></select></label>
      <div className="admin-form-pair"><label>Date<input name="scheduled_date" type="date" defaultValue={request.scheduled_at ? localDay(request.scheduled_at,request.timezone):''} /></label><label>Time<input name="scheduled_time" type="time" defaultValue={request.scheduled_at ? localClock(request.scheduled_at,request.timezone):''} /></label></div>
      <label>Timezone<input name="timezone" maxLength={80} required defaultValue={request.timezone} /></label><label>Private admin note<textarea name="admin_note" maxLength={1000} defaultValue={request.admin_note ?? ''} /></label><p className="admin-muted">Canceling or declining releases the reserved time. Completing closes the appointment.</p><SubmitButton pendingLabel="Saving…">Save reservation</SubmitButton>
    </form>}
  </>;
}

export default function Queue({ requests, initialRequest, initialFilter, error, saved }: { requests: QueueRequest[]; initialRequest?: string; initialFilter?: string; error?: boolean; saved?: boolean }) {
  const [filter,setFilter] = useState(initialFilter ?? 'All Requests');
  const [search,setSearch] = useState('');
  const [service,setService] = useState('');
  const [from,setFrom] = useState('');
  const [to,setTo] = useState('');
  const [page,setPage] = useState(0);
  const [selectedId,setSelected] = useState<string | null>(initialRequest ?? requests[0]?.id ?? null);
  const [ascending,setAscending] = useState(false);
  const rows=requests.filter(r => (filter==='All Requests'||requestStage(r)===filter)&&(!service||r.service_slug===service)&&(!from||localDay(r.created_at,r.timezone)>=from)&&(!to||localDay(r.created_at,r.timezone)<=to)&&[r.client_name,r.contact_email,r.service_title,r.payment_reference].join(' ').toLowerCase().includes(search.toLowerCase())).sort((a,b)=>ascending?a.created_at.localeCompare(b.created_at):b.created_at.localeCompare(a.created_at));
  const pages=Math.max(1,Math.ceil(rows.length/8));
  const activePage=Math.min(page,pages-1);
  const selected=requests.find(r=>r.id===selectedId);
  const offerings=Array.from(new Map(requests.map(r=>[r.service_slug,r.service_title])));
  return <section>
    <header className="admin-heading"><p className="eyebrow">Sanctuary administration</p><h1>Scheduling Queue</h1><p>Review requests, verify payments, and schedule services.</p></header>
    {error && <p className="admin-notice" role="alert">The queue or requested change could not be loaded. Check the appointment details and refresh to try again.</p>}
    {saved && <p className="admin-notice" role="status">Reservation saved. The list and appointment details are up to date.</p>}
    <div className="queue-filter-tabs" aria-label="Filter requests">{filters.map(f=><button key={f} type="button" aria-pressed={filter===f} onClick={()=>{setFilter(f);setPage(0);}}>{f}<span>{f==='All Requests'?requests.length:requests.filter(r=>requestStage(r)===f).length}</span></button>)}</div>
    <div className="queue-toolbar"><label className="queue-search"><Search size={18}/><input aria-label="Search requests" placeholder="Search name, email, service, or reference…" value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}} /></label><select aria-label="Filter by service" value={service} onChange={e=>{setService(e.target.value);setPage(0);}}><option value="">All services</option>{offerings.map(([slug,title])=><option key={slug} value={slug}>{title}</option>)}</select><details className="date-filter"><summary>Date range</summary><label>Requested from<input type="date" value={from} onChange={e=>{setFrom(e.target.value);setPage(0);}} /></label><label>Through<input type="date" value={to} onChange={e=>{setTo(e.target.value);setPage(0);}} /></label><button type="button" onClick={()=>{setFrom('');setTo('');}}>Clear dates</button></details></div>
    <div className={'queue-columns '+(!selected?'no-selection':'')}><section className="admin-card request-list"><div className="request-table-head"><span>Client / Service</span><span>Status</span><button type="button" onClick={()=>setAscending(!ascending)}>Requested {ascending?'↑':'↓'}</button></div>
      {rows.slice(activePage*8,activePage*8+8).map(r=><button type="button" className={'request-row '+(selectedId===r.id?'selected':'')} aria-pressed={selectedId===r.id} key={r.id} onClick={()=>setSelected(r.id)}><span className="request-person"><span className="admin-avatar">{initials(r.client_name)}</span><span><strong>{r.client_name}</strong><small>{r.service_title}</small></span></span><span className={'admin-badge '+stageClass(r)}>{requestStage(r)}</span><time>{formatTime(r.created_at,r.timezone)}</time></button>)}
      {!rows.length && <p className="admin-empty">{requests.length?'No requests match these filters.':'No requests yet. Customer reservations will appear here.'}</p>}
      <footer className="queue-pagination"><span>{rows.length?'Showing '+(activePage*8+1)+'–'+Math.min(activePage*8+8,rows.length)+' of '+rows.length+' requests':'0 requests'}</span><div><button aria-label="Previous page" disabled={activePage===0} onClick={()=>setPage(activePage-1)}><ChevronLeft size={18}/></button><span>{activePage+1} / {pages}</span><button aria-label="Next page" disabled={activePage+1>=pages} onClick={()=>setPage(activePage+1)}><ChevronRight size={18}/></button></div></footer>
    </section>{selected && <article className="admin-card request-detail"><button className="detail-close" aria-label="Close request details" onClick={()=>setSelected(null)}><X size={20}/></button><Detail key={selected.id+selected.updated_at} request={selected} /></article>}</div>
  </section>;
}
