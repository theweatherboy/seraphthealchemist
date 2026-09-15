import Management from '@/components/admin/Management';
export default function ServicesPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  return <Management searchParams={searchParams} section="services" />;
}
