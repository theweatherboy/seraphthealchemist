import type { Database } from '@/lib/supabase/database.types';

export type RequestRow = Database['public']['Tables']['service_requests']['Row'];
export type QueueRequest = RequestRow & { client_name: string };
export const filters = ['All Requests', 'Needs Verification', 'Ready to Schedule', 'Scheduled', 'Completed', 'Closed'] as const;
export function requestStage(request: RequestRow): typeof filters[number] {
  if (request.status === 'completed') return 'Completed';
  if (request.status === 'declined' || request.status === 'canceled') return 'Closed';
  if (request.payment_status !== 'verified') return 'Needs Verification';
  if (request.status === 'scheduled' && request.scheduled_at) return 'Scheduled';
  return 'Ready to Schedule';
}
export const stageClass = (request: RequestRow) => ['all', 'needs', 'ready', 'scheduled', 'completed', 'closed'][filters.indexOf(requestStage(request))];
export const formatTime = (value: string | null, timezone = 'America/Chicago') => value ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: timezone }).format(new Date(value)) : 'Not scheduled';
export const localDay = (value: string, timezone: string) => new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date(value));
export const localClock = (value: string, timezone: string) => new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(value));
export const paymentName = (value: string) => ({ cash_app: 'Cash App', paypal: 'PayPal', venmo: 'Venmo', stripe: 'Stripe' }[value] ?? value);
