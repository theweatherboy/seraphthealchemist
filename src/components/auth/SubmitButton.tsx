'use client';

import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';

export default function SubmitButton({ children, pendingLabel = 'Please wait…', className = 'account-button' }: { children: ReactNode; pendingLabel?: string; className?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className={className} disabled={pending} aria-disabled={pending}>
    {pending ? pendingLabel : children}
  </button>;
}
