import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createHash } from 'crypto';

async function requirePartner(req: NextRequest): Promise<{ id: string } | null> {
  const token = req.cookies.get('jez_bs_session')?.value;
  if (!token) return null;

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from('sessions')
    .select('partner_id')
    .eq('token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  return session ? { id: session.partner_id } : null;
}

export async function GET(request: NextRequest) {
  const partner = await requirePartner(request);
  if (!partner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 20);
  const offset = (page - 1) * limit;

  const supabase = getSupabaseAdmin();
  const { data: transactions, count } = await supabase
    .from('wallet_transactions')
    .select('*', { count: 'exact' })
    .eq('partner_id', partner.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return NextResponse.json({ success: true, data: { transactions, total: count ?? 0, page, limit } });
}