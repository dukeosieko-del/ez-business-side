import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createSession } from '@/lib/auth/session';
import { env } from '@/lib/config/env';
import { createHmac, randomUUID } from 'crypto';
import { isOnboarded } from '@/lib/onboarding/state';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/error?reason=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth/error?reason=missing_code', request.url));
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = randomUUID();
    const body = JSON.stringify({ code, client_id: 'ez-business-side' });
    const bodyHash = createHmac('sha256', env.JANJEZ_MAIN_API_SECRET)
      .update(body)
      .digest('hex');
    const payload = `POST\n/oauth/token\n${bodyHash}\n${timestamp}\n${nonce}`;
    const signature = createHmac('sha256', env.JANJEZ_MAIN_API_SECRET)
      .update(payload)
      .digest('hex');

    const exchangeResponse = await fetch(`${env.JANJEZ_MAIN_API_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Business-Side-API-Key': env.JANJEZ_MAIN_API_KEY,
        'X-Timestamp': timestamp,
        'X-Nonce': nonce,
        'X-Signature': signature,
      },
      body,
      signal: AbortSignal.timeout(15000),
    });

    if (!exchangeResponse.ok) {
      throw new Error(`Token exchange failed: ${exchangeResponse.status}`);
    }

    const exchangeJson = await exchangeResponse.json();

    if (!exchangeJson.success) {
      throw new Error(exchangeJson.error?.message ?? 'Token exchange failed');
    }

    const { janjez_user_id, email, full_name, phone } = exchangeJson.data;

    const supabase = getSupabaseAdmin();
    const { data: existingPartner } = await supabase
      .from('partners')
      .select('id, onboarding_state, status')
      .eq('janjez_user_id', janjez_user_id)
      .single();

    let partnerId: string;
    let onboardingState: string = 'pending';

    if (existingPartner) {
      partnerId = existingPartner.id;
      onboardingState = existingPartner.onboarding_state ?? 'pending';
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
        .select('id, onboarding_state')
        .single();

      if (createError || !newPartner) {
        throw new Error(`Partner creation failed: ${createError?.message}`);
      }

      partnerId = newPartner.id;
      onboardingState = newPartner.onboarding_state;
    }

    await createSession({
      partner_id: partnerId,
      janjez_user_id,
      created_at: new Date().toISOString(),
    });

    await supabase.from('audit_log').insert({
      actor_type: 'partner',
      actor_id: partnerId,
      action: 'sso_login',
      metadata: { janjez_user_id, onboardingState },
    });

    if (!isOnboarded(onboardingState as Parameters<typeof isOnboarded>[0])) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('SSO callback error:', message);
    return NextResponse.redirect(
      new URL(`/auth/error?reason=sso_failed&detail=${encodeURIComponent(message)}`, request.url)
    );
  }
}
