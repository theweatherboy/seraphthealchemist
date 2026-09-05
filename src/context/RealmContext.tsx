"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Realm, Chakra } from '@/data/realms';

interface RealmContextType {
  currentRealm: Realm;
  currentChakra: Chakra;
  setRealm: (realmId: string) => void;
}

const RealmContext = createContext<RealmContextType | undefined>(undefined);

export function RealmProvider({ children }: { children: ReactNode }) {
  const [realmId, setRealmId] = useState('earth');

  // Import realms here to avoid circular deps if any
  const { realms } = require('@/data/realms');
  const currentRealm = realms.find(r => r.id === realmId) || realms[0];

  const setRealm = (id: string) => {
    setRealmId(id);
  };

  return (
    <RealmContext.Provider value={{
      currentRealm,
      currentChakra: currentRealm.chakra,
      setRealm
    }}>
      {children}
    </RealmContext.Provider>
  );
}

export function useRealm() {
  const context = useContext(RealmContext);
  if (context === undefined) {
    throw new Error('useRealm must be used within a RealmProvider');
  }
  return context;
}
