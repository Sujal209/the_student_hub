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
      .select('file_path, college_domain, uploader_id, title, download_count')
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
      .createSignedUrl((note as any).file_path, 3600); // 1 hour expiry

    if (signedUrlError) {
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 });
    }

    // Update download count
    if (user_id) {
      await supabase
        .from('notes')
        .update({ 
          download_count: ((note as any).download_count || 0) + 1 
        })
        .eq('id', params.id);
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