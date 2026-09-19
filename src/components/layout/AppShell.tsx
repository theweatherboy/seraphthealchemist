"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { RealmProvider } from '@/context/RealmContext';
import GlobalNavigation from './GlobalNavigation';
import RealmIndicator from './RealmIndicator';
import LivingTapestry from '@/components/visual/LivingTapestryCanvasV2';
import ParticleField from '@/components/visual/ParticleField';
import EnvironmentBackground from '@/components/visual/EnvironmentBackground';

import PaymentProvider from '@/components/ui/PaymentProvider';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const admin = pathname === '/admin' || pathname.startsWith('/admin/');
  const home = pathname === '/';
  return (
    <RealmProvider>
      <PaymentProvider>
      <div className={`relative min-h-screen w-full overflow-x-hidden ${home ? 'bg-[#f8f3ed] text-[#422a39]' : 'bg-obsidian text-text'}`}>
        {/* Living Environment (Persists) */}
        {!home && <div className="fixed inset-0 z-0 pointer-events-none">
          <EnvironmentBackground />
          <ParticleField />
          <LivingTapestry />
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
