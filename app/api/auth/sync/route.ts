import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createSession } from '@/lib/auth/session';
import { env } from '@/lib/config/env';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { janjez_user_id, email, full_name, phone } = body;

  if (!janjez_user_id || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: existingPartner, error: fetchError } = await supabase
    .from('partners')
    .select('id, janjez_user_id, janjez_email, display_name, phone, status, onboarding_state')
    .eq('janjez_user_id', janjez_user_id)
    .single();

  let partner: Record<string, unknown>;

  if (!fetchError && existingPartner) {
    partner = existingPartner as Record<string, unknown>;
  } else {
    const { data: newPartner, error: createError } = await supabase
      .from('partners')
      .insert({
        janjez_user_id,
        janjez_email: email,
        display_name: full_name ?? email.split('@')[0],
        phone: phone ?? '',
        status: 'pending',
        onboarding_state: 'pending',
      })
      .select('id, janjez_user_id, janjez_email, display_name, phone, status, onboarding_state')
      .single();

    if (createError || !newPartner) {
      return NextResponse.json(
        { error: `Partner creation failed: ${createError?.message}` },
        { status: 500 }
      );
    }

    partner = newPartner as Record<string, unknown>;
  }

  await createSession({
    partner_id: partner.id as string,
    janjez_user_id: partner.janjez_user_id as string,
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, partner });
}