'use client';

import { useEffect } from 'react';
import { useRealm } from '@/context/RealmContext';

export default function ChakraAtmosphere({ realmId }: { realmId: string }) {
  const { setRealm } = useRealm();
  useEffect(() => { setRealm(realmId); }, [realmId, setRealm]);
  return null;
}
