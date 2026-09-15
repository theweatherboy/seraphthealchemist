'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, Users, SlidersHorizontal, MessageSquare, ListChecks, ArrowUpRight, Sparkles } from 'lucide-react';
import { signOut } from '@/app/login/actions';
import SubmitButton from '@/components/auth/SubmitButton';

const links = [
  ['/admin', 'Dashboard', LayoutDashboard],
  ['/admin/scheduling', 'Scheduling Queue', ListChecks],
  ['/admin/calendar', 'Calendar', CalendarDays],
  ['/admin/clients', 'Clients', Users],
  ['/admin/services', 'Availability & Services', SlidersHorizontal],
  ['/admin/testimonies', 'Testimonies', MessageSquare],
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  return <aside className="admin-sidebar">
    <Link href="/admin" className="admin-brand"><Sparkles size={38} strokeWidth={1} /><strong>SERAPH</strong><span>THE ALCHEMIST</span><i aria-hidden="true">✧</i></Link>
    <nav aria-label="Administration">{links.map(([href, label, Icon]) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined}><Icon size={21} strokeWidth={1.4} />{label}</Link>)}</nav>
    <div className="admin-sidebar-bottom"><Link href="/" className="admin-site-link">Visit sanctuary <ArrowUpRight size={16} /></Link><form action={signOut}><SubmitButton pendingLabel="Signing out…">Log out</SubmitButton></form><p>HEAL · ALIGN<br />INTEGRATE · BECOME</p></div>
  </aside>;
}
