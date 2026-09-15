import Management from '@/components/admin/Management';
export default function TestimoniesPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  return <Management searchParams={searchParams} section="testimonies" />;
}
