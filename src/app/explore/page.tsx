import type { Metadata } from 'next';
import { getServices } from '@/lib/services';
import PathFinder from './PathFinder';

export const metadata: Metadata = { title: 'Explore Your Path | Seraph the Alchemist', description: 'Find a thoughtful starting point and explore services that fit your intentions.' };

export default async function ExplorePage() {
  const services = await getServices();
  return <PathFinder services={services} />;
}
