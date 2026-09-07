import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from './server';

export async function requireAccount(destination: '/account' | '/admin' = '/account') {
  const client = await createClient();
  if (!client) redirect('/login');
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) redirect(`/login?next=${encodeURIComponent(destination)}`);
  return { client, user: data.user };
}
