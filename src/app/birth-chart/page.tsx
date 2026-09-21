import type { Metadata } from 'next';
import BirthChartExperience from './BirthChartExperience';

export const metadata: Metadata = {
  title: 'Birth Chart & Year-Ahead Transits | Seraph, The Alchemist',
  description: 'Explore your Sun sign, natal chart, exact personal transit dates, and symbolic growth themes for the coming year.',
  alternates: { canonical: 'https://www.seraphthealchemist.com/birth-chart' },
};

export default function BirthChartPage() {
  return <BirthChartExperience />;
}
