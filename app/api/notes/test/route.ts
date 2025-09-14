import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Simple query to test database connection
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .limit(10);

    if (notesError) {
      console.error('Notes query error:', notesError);
      return NextResponse.json({ 
        error: notesError.message,
        details: notesError 
      }, { status: 400 });
    }

    // Test users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .limit(5);

    // Test subjects table
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name')
      .limit(5);

    return NextResponse.json({ 
      status: 'success',
      data: {
        notes: notes || [],
        notesCount: notes?.length || 0,
        users: users || [],
        usersCount: users?.length || 0,
        subjects: subjects || [],
        subjectsCount: subjects?.length || 0,
      },
      errors: {
        notes: notesError?.message || null,
        users: usersError?.message || null,
        subjects: subjectsError?.message || null,
      }
    });

  } catch (error: any) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}