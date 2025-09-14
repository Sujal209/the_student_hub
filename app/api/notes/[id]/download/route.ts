import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseClient';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { user_id } = body;

    const supabase = createAdminClient();

    // Get note details
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('file_path, college_domain, uploader_id, title')
      .eq('id', params.id)
      .single();

    if (noteError) {
      if (noteError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }
      return NextResponse.json({ error: noteError.message }, { status: 400 });
    }

    // Create signed URL for download
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('student-notes')
      .createSignedUrl(note.file_path, 3600); // 1 hour expiry

    if (signedUrlError) {
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 });
    }

    // Track the download
    if (user_id) {
      const { error: trackingError } = await supabase
        .from('note_downloads')
        .insert({
          note_id: params.id,
          user_id,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
        });

      if (trackingError) {
        console.error('Error tracking download:', trackingError);
        // Don't fail the request if tracking fails
      }
    }

    return NextResponse.json({ 
      download_url: signedUrlData.signedUrl,
      filename: note.title
    });

  } catch (error: any) {
    console.error('Error generating download:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}