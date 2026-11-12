import type { Metadata } from 'next';
import Home from '../../page';
import StoneGallery from './StoneGallery';

export const metadata: Metadata = {
  title: 'Stone palette studio | Seraph',
  robots: { index: false, follow: false },
};

export default function StonePage() {
  return <StoneGallery><Home /></StoneGallery>;
}
