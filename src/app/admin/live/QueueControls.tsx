'use client';

import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import SubmitButton from '@/components/auth/SubmitButton';
import { updateLiveEntry } from './actions';

export function QueueRefresh() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') startTransition(() => router.refresh());
    }, 20000);
    return () => clearInterval(timer);
  }, [router]);
  return <button type="button" className="account-button" disabled={pending} onClick={() => startTransition(() => router.refresh())}>{pending ? 'Refreshing…' : 'Refresh queue'}</button>;
}

export function QueueAction({ id, operation, label, person }: { id: string; operation: string; label: string; person: string }) {
  return <form action={updateLiveEntry} onSubmit={event => {
    if (operation === 'removed' && !window.confirm(`Remove ${person} from the LIVE queue? The entry remains in Removed for your records.`)) event.preventDefault();
  }}><input type="hidden" name="id" value={id} /><input type="hidden" name="operation" value={operation} /><SubmitButton pendingLabel="Saving…">{label}</SubmitButton></form>;
}
