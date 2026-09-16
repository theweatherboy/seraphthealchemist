import { getServices } from '@/lib/services';
import ServicesContent from '@/components/services/ServicesContent';

export default async function ServicesPage() {
  return <ServicesContent services={await getServices()} />;
}
