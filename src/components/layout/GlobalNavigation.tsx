"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function GlobalNavigation() {
  const [visible, setVisible] = useState<string[] | null>(null);
  const pathname = usePathname();
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/navigation', { cache: 'no-store', signal: controller.signal }).then(response => response.ok ? response.json() : null).then(payload => payload && setVisible(payload.items.filter((item: { is_visible?: boolean }) => item.is_visible !== false).map((item: { href: string }) => item.href))).catch(() => {});
    return () => controller.abort();
  }, [pathname]);
  const links = [['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/grimoire', 'Grimoire'], ['/reviews', 'Testimonies'], ['/forge', 'Offerings'], ['/support', 'Support'], ['/contact', 'Connect'], ['/account', 'Account'], ['/terms-of-service', 'Terms of Service'], ['/privacy-policy', 'Privacy Policy']] as const;
  return (
    <nav className="site-navigation" aria-label="Main navigation">
      {links.filter(([href]) => visible === null || visible.includes(href)).map(([href, label]) => <Link href={href} key={href} prefetch={href === '/account' ? false : undefined} className="hover:text-white transition-colors">{label}</Link>)}
    </nav>
  );
}
