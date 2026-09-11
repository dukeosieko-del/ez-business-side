import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  const checks: Record<string, string> = {};

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('partners').select('id').limit(1);
    checks.supabase = error ? 'error' : 'ok';
  } catch {
    checks.supabase = 'error';
  }

  return NextResponse.json({
    status: Object.values(checks).every((v) => v === 'ok') ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  });
}
