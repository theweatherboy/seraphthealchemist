import { services } from '@/data/services';
import ServiceDetailContent from '@/components/services/ServiceDetailContent';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const service = services.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  return <ServiceDetailContent service={service} />;
}
