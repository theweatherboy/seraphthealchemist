'use client';

import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';

export default function SubmitButton({ children, pendingLabel = 'Please wait…' }: { children: ReactNode; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className="account-button" disabled={pending} aria-disabled={pending}>
    {pending ? pendingLabel : children}
  </button>;
}
