import { NextRequest, NextResponse } from 'next/server';
import { publishPanel } from '@/lib/panels/publish';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = request.cookies.get('jez_bs_session')?.value;
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'No session' } },
      { status: 401 }
    );
  }

  const result = await publishPanel(id, session);

  if (!result.published) {
    return NextResponse.json(
      { success: false, error: { code: 'PUBLISH_FAILED', message: result.reason ?? 'Publish failed' } },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, data: { published: true } });
}
