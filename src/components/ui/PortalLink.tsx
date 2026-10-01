import Link from 'next/link';
import type { AnchorHTMLAttributes } from 'react';

export default function PortalLink({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <Link href={href} {...props}>{children}</Link>;
}
