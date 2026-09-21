"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { RealmProvider } from '@/context/RealmContext';
import GlobalNavigation from './GlobalNavigation';
import RealmIndicator from './RealmIndicator';
import EnvironmentBackground from '@/components/visual/EnvironmentBackground';

import PaymentProvider from '@/components/ui/PaymentProvider';
import { pageArtwork } from '@/lib/page-artwork';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const admin = pathname === '/admin' || pathname.startsWith('/admin/');
  const home = pathname === '/';
  const parchment = !home && !admin && !pathname.startsWith('/chakras/');
  const artwork = pageArtwork(pathname);
  return (
    <RealmProvider>
      <PaymentProvider>
      <div className={`relative min-h-screen w-full overflow-x-hidden bg-obsidian text-text${parchment ? ' parchment-site' : ''}`} data-folio={artwork} style={artwork ? { '--folio-art': `url('/images/pages/${artwork}-v1.webp')` } as React.CSSProperties : undefined}>
        {/* Living Environment (Persists) */}
        {!home && <div className="fixed inset-0 z-0 pointer-events-none">
          <EnvironmentBackground />
        </div>}

        {/* Persistent UI */}
        {!admin && <GlobalNavigation />}
        {!admin && !home && <RealmIndicator />}

        {/* Page Content (Transitions) */}
        <main id="main-content" className="relative z-10">
          {children}
        </main>
      </div>
    </PaymentProvider>
    </RealmProvider>
  );
}
