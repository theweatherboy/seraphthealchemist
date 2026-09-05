"use client";

import React from 'react';
import { useRealm } from '@/context/RealmContext';
import { realms } from '@/data/realms';

export default function RealmIndicator() {
  const { currentRealm, setRealm } = useRealm();

  return (
    <div className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4 p-3 rounded-full bg-glass border border-glass-border backdrop-blur-[var(--blur-glass)]">
      {realms.map((realm) => (
        <button
          key={realm.id}
          aria-label={"Set atmosphere to " + realm.name}
          aria-pressed={currentRealm.id === realm.id}
          onClick={() => setRealm(realm.id)}
          className="group relative flex items-center justify-center w-3 h-3 rounded-full transition-all duration-500"
          style={{
            backgroundColor: currentRealm.id === realm.id ? realm.color : 'rgba(255,255,255,0.2)',
            boxShadow: currentRealm.id === realm.id ? `0 0 10px ${realm.color}` : 'none',
            transform: currentRealm.id === realm.id ? 'scale(1.5)' : 'scale(1)'
          }}
        >
          <span className="absolute right-8 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-celestial whitespace-nowrap text-muted">
            {realm.name}
          </span>
        </button>
      ))}
    </div>
  );
}
