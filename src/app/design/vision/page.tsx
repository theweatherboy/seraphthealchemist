import type { Metadata } from 'next';
import { Italianno } from 'next/font/google';
import VisionGallery from './VisionGallery';

const script = Italianno({ weight: '400', subsets: ['latin'], variable: '--font-vision-script' });
export const metadata: Metadata = { title: 'Homepage vision samples | Seraph', robots: { index: false, follow: false } };
export default function VisionDesignPage() {
  return <div className={script.variable}><VisionGallery /></div>;
}
