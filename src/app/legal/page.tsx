import { permanentRedirect } from 'next/navigation';

export default function LegalPage() {
  permanentRedirect('/terms-of-service');
}
