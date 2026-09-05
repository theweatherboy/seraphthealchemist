"use client";

import React from 'react';
import { RealmProvider } from '@/context/RealmContext';
import GlobalNavigation from './GlobalNavigation';
import RealmIndicator from './RealmIndicator';
import LivingTapestry from '@/components/visual/LivingTapestry';
import ParticleField from '@/components/visual/ParticleField';
import EnvironmentBackground from '@/components/visual/EnvironmentBackground';

import PaymentProvider from '@/components/ui/PaymentProvider';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <RealmProvider>
      <PaymentProvider>
      <div className="relative min-h-screen w-full bg-obsidian text-text overflow-x-hidden">
        {/* Living Environment (Persists) */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <EnvironmentBackground />
          <ParticleField />
          <LivingTapestry />
        </div>

        {/* Persistent UI */}
        <GlobalNavigation />
        <RealmIndicator />

        {/* Page Content (Transitions) */}
        <main className="relative z-10">
          {children}
        </main>
      </div>
    </PaymentProvider>
    </RealmProvider>
  );
}
