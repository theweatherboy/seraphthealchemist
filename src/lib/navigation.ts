import { createClient } from '@/lib/supabase/server';
export const defaultNavigation = [
  { href: '/', label: 'Home', sort_order: 0 }, { href: '/about', label: 'About', sort_order: 1 }, { href: '/services', label: 'Services', sort_order: 2 }, { href: '/grimoire', label: 'Grimoire', sort_order: 3 }, { href: '/reviews', label: 'Testimonies', sort_order: 4 }, { href: '/forge', label: 'Offerings', sort_order: 5 }, { href: '/support', label: 'Support', sort_order: 6 }, { href: '/contact', label: 'Connect', sort_order: 7 }, { href: '/account', label: 'Account', sort_order: 8 }, { href: '/terms-of-service', label: 'Terms of Service', sort_order: 9 }, { href: '/privacy-policy', label: 'Privacy Policy', sort_order: 10 },
] as const;
export type NavigationItem = { href: string; label: string; sort_order: number; is_visible?: boolean };
export async function getNavigationVisibility() {
  const client = await createClient();
  if (!client) return defaultNavigation.map(item => ({ ...item, is_visible: true }));
  const { data, error } = await client.from('navigation_visibility').select('href,label,sort_order,is_visible').order('sort_order');
  if (error) return defaultNavigation.map(item => ({ ...item, is_visible: true }));
  const saved = new Map((data ?? []).map(item => [item.href, item]));
  return defaultNavigation.map(item => ({ ...item, is_visible: item.href === '/terms-of-service' || item.href === '/privacy-policy' || (saved.get(item.href)?.is_visible ?? true) }));
}
