import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedPartner } from '@/lib/partner/auth';
import { provisionDemoPanel } from '@/lib/panels/provision';

export async function POST(request: NextRequest) {
  const partnerId = await getAuthenticatedPartner(request);
  if (!partnerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const panel = await provisionDemoPanel(partnerId);
    return NextResponse.json({ success: true, data: panel }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Demo provisioning failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
