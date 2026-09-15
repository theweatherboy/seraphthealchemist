import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/admin';
import Sidebar from '@/components/admin/Sidebar';
import './admin.css';

export const metadata: Metadata = { title: 'Administration | Seraph, The Alchemist', robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <div className="admin-shell"><Sidebar /><div className="admin-content"><div className="admin-moon" aria-hidden="true" />{children}</div></div>;
}
