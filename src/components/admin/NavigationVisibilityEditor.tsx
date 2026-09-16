'use client';
import { useEffect, useState } from 'react';
import SubmitButton from '@/components/auth/SubmitButton';
import { updateNavigationVisibility } from '@/app/admin/actions';
import type { NavigationItem } from '@/lib/navigation';
export default function NavigationVisibilityEditor() {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [available, setAvailable] = useState(true);
  useEffect(() => { fetch('/api/navigation').then(async response => { if (!response.ok) throw new Error(); const data = await response.json(); setItems(data.items); }).catch(() => setAvailable(false)); }, []);
  return <div className="account-next"><h2>Visible site links</h2><p>Hide links while you prepare the site. Hidden links disappear from the main menu, but their pages remain reachable by direct URL. Terms of Service and Privacy Policy stay visible.</p>{!available ? <p role="alert">Menu visibility is unavailable. Apply the navigation migration and reload this page.</p> : <div className="eligible-services">{items.map(item => <div key={item.href}><span><strong>{item.label}</strong><small>{item.href}</small></span>{item.href === '/terms-of-service' || item.href === '/privacy-policy' ? <span>Always visible</span> : <form action={updateNavigationVisibility}><input type="hidden" name="href" value={item.href} /><input type="hidden" name="is_visible" value={item.is_visible ? 'false' : 'true'} /><SubmitButton pendingLabel="Saving…">{item.is_visible ? 'Hide link' : 'Show link'}</SubmitButton></form>}</div>)}</div>}</div>;
}
