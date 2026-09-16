import { NextResponse } from 'next/server';
import { getNavigationVisibility } from '@/lib/navigation';
export const dynamic = 'force-dynamic';
export async function GET() { const items = await getNavigationVisibility(); return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } }); }
