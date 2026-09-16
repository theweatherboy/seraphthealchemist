import 'server-only';
import { services as defaults } from '@/data/services';
import { createClient } from '@/lib/supabase/server';

export async function getServices() {
  const client = await createClient();
  if (!client) return defaults;
  const { data, error } = await client.from('service_catalog').select('*');
  // Allow the code to precede the catalog migration during rollout.
  if (error?.code === 'PGRST205' || error?.code === '42P01') return defaults;
  if (error) throw new Error('The service catalog could not be loaded. Please try again.');
  const saved = new Map((data ?? []).map(service => [service.slug, service]));
  return defaults.map(service => ({ ...service, ...saved.get(service.slug) }));
}
