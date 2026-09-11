import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_FILE', message: 'No file provided' } },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabase = getSupabaseAdmin();

    const { data: panel } = await supabase
      .from('child_panels')
      .select('id')
      .eq('id', id)
      .eq('partner_id', session)
      .maybeSingle();

    if (!panel) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Panel not found' } },
        { status: 404 }
      );
    }

    const ext = file.name.split('.').pop() ?? 'png';
    const path = `panels/${id}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('panel-assets')
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: { code: 'UPLOAD_ERROR', message: uploadError.message } },
        { status: 500 }
      );
    }

    const { data: publicUrl } = supabase.storage
      .from('panel-assets')
      .getPublicUrl(path);

    return NextResponse.json({ success: true, data: { url: publicUrl.publicUrl } });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'UPLOAD_ERROR', message: 'Upload failed' } },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
