import 'server-only';
import { services as defaults, type Service } from '@/data/services';
import { createClient } from '@/lib/supabase/server';

export type ManagedService = Service & { isActive: boolean; isDeleted: boolean; hasCatalogRecord: boolean };

type CatalogService = {
  slug: string; title: string; subtitle: string; description: string; price: number; duration: string;
  category: Service['category'] | null; category_label: string | null; who_it_is_for: string | null;
  approach: string | null; what_to_expect: string | null; preparation: string | null;
  deliverables: string[] | null; realm_id: string | null; chakra: string | null; color: string | null;
  is_active: boolean; is_deleted: boolean;
};

const categoryLabels: Record<Service['category'], string> = {
  seer: 'THE SEER', healer: 'THE HEALER', alchemist: 'THE ALCHEMIST', oracle: 'THE ORACLE', journey: 'THE JOURNEY',
};

export async function getServices(options: { includeInactive?: boolean } = {}): Promise<ManagedService[]> {
  const client = await createClient();
  if (!client) return defaults.map(service => ({ ...service, isActive: true, isDeleted: false, hasCatalogRecord: false }));
  const { data, error } = await client.from('service_catalog').select('*');
  if (error?.code === 'PGRST205' || error?.code === '42P01') return defaults.map(service => ({ ...service, isActive: true, isDeleted: false, hasCatalogRecord: false }));
  if (error) throw new Error('The service catalog could not be loaded. Please try again.');

  const saved = new Map(((data ?? []) as CatalogService[]).map(service => [service.slug, service]));
  const merged: ManagedService[] = defaults.map(service => {
    const row = saved.get(service.slug);
    if (!row) return { ...service, isActive: true, isDeleted: false, hasCatalogRecord: false };
    return {
      ...service,
      title: row.title, subtitle: row.subtitle, description: row.description, price: Number(row.price), duration: row.duration,
      category: row.category ?? service.category,
      categoryLabel: row.category_label ?? service.categoryLabel ?? categoryLabels[row.category ?? service.category],
      whoItIsFor: row.who_it_is_for ?? service.whoItIsFor,
      approach: row.approach ?? service.approach,
      whatToExpect: row.what_to_expect ?? service.whatToExpect,
      preparation: row.preparation ?? service.preparation,
      deliverables: row.deliverables ?? service.deliverables,
      realmId: row.realm_id ?? service.realmId,
      chakra: row.chakra ?? service.chakra,
      color: row.color ?? service.color,
      isActive: row.is_active, isDeleted: row.is_deleted, hasCatalogRecord: true,
    };
  });

  for (const row of saved.values()) {
    if (defaults.some(service => service.slug === row.slug)) continue;
    const category = row.category ?? 'journey';
    merged.push({
      slug: row.slug, title: row.title, subtitle: row.subtitle, description: row.description, price: Number(row.price), duration: row.duration,
      category, categoryLabel: row.category_label ?? categoryLabels[category],
      whoItIsFor: row.who_it_is_for ?? 'Those seeking thoughtful, personalized support.',
      approach: row.approach ?? 'A grounded, intuitive approach shaped around your intention.',
      whatToExpect: row.what_to_expect ?? 'A welcoming session centered on your questions and next steps.',
      preparation: row.preparation ?? 'Bring any questions or intentions you would like to explore.',
      deliverables: row.deliverables ?? ['Personal guidance'], realmId: row.realm_id ?? 'healing',
      chakra: row.chakra ?? 'heart', color: row.color ?? '#3f8f68',
      isActive: row.is_active, isDeleted: row.is_deleted, hasCatalogRecord: true,
    });
  }

  return options.includeInactive ? merged : merged.filter(service => service.isActive && !service.isDeleted);
}
