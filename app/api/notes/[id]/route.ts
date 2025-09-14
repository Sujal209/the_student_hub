import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('notes')
      .select(`
        *,
        users!notes_uploader_id_fkey(full_name),
        subjects!notes_subject_id_fkey(name, color)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ note: data });

  } catch (error: any) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      subject_id,
      semester,
      year_of_study,
      tags,
      visibility,
    } = body;

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('notes')
      .update({
        title: title || undefined,
        description: description !== undefined ? description : undefined,
        subject_id: subject_id !== undefined ? subject_id : undefined,
        semester: semester !== undefined ? semester : undefined,
        year_of_study: year_of_study !== undefined ? year_of_study : undefined,
        tags: tags !== undefined ? tags : undefined,
        visibility: visibility || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ note: data });

  } catch (error: any) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();

    // First, get the note to check file path
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('file_path')
      .eq('id', params.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    // Delete file from storage
    if (note.file_path) {
      const { error: storageError } = await supabase.storage
        .from('student-notes')
        .remove([note.file_path]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Don't fail the request if storage deletion fails
      }
    }

    return NextResponse.json({ message: 'Note deleted successfully' });

  } catch (error: any) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}