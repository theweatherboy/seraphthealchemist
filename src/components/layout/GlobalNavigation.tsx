"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function GlobalNavigation() {
  const [visible, setVisible] = useState<string[] | null>(null);
  useEffect(() => { fetch('/api/navigation').then(response => response.ok ? response.json() : null).then(payload => payload && setVisible(payload.items.map((item: { href: string }) => item.href))).catch(() => {}); }, []);
  const links = [['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/grimoire', 'Grimoire'], ['/reviews', 'Testimonies'], ['/forge', 'Offerings'], ['/support', 'Support'], ['/contact', 'Connect'], ['/account', 'Account'], ['/terms-of-service', 'Terms of Service'], ['/privacy-policy', 'Privacy Policy']] as const;
  return (
    <nav className="site-navigation" aria-label="Main navigation">
      {links.filter(([href]) => visible === null || visible.includes(href)).map(([href, label]) => <Link href={href} key={href} prefetch={href === '/account' ? false : undefined} className="hover:text-white transition-colors">{label}</Link>)}
    </nav>
  );
}
