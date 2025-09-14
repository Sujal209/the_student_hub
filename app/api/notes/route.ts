import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseClient';
import { cookies } from 'next/headers';
import { sanitizeSearchQuery, sanitizeString } from '@/lib/sanitize';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const search = sanitizeSearchQuery(searchParams.get('search') || '');
    const subjectId = searchParams.get('subject_id');
    const semester = sanitizeString(searchParams.get('semester') || '');
    const year = searchParams.get('year');
    const tags = searchParams.get('tags')?.split(',').map(tag => sanitizeString(tag)).filter(Boolean);

    const supabase = createAdminClient();

    let query = supabase
      .from('notes')
      .select(`
        *,
        users!notes_uploader_id_fkey(full_name),
        subjects(name)
      `)
      .eq('status', 'active')
      .in('visibility', ['public', 'college_only'])
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    // Apply filters
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    if (semester) {
      query = query.eq('semester', semester);
    }
    if (year) {
      query = query.eq('year_of_study', parseInt(year));
    }
    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }
    if (search) {
      query = query.textSearch('title', search);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      notes: data || [],
      pagination: {
        page,
        limit,
        hasMore: (data || []).length === limit
      }
    });

  } catch (error: any) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title: rawTitle,
      description: rawDescription,
      subject_id,
      file_name: rawFileName,
      file_path,
      file_size,
      file_type,
      mime_type,
      semester: rawSemester,
      year_of_study,
      tags: rawTags,
      visibility,
      college_domain,
      uploader_id
    } = body;

    // Sanitize inputs
    const title = sanitizeString(rawTitle);
    const description = rawDescription ? sanitizeString(rawDescription) : null;
    const file_name = sanitizeString(rawFileName);
    const semester = rawSemester ? sanitizeString(rawSemester) : null;
    const tags = rawTags ? rawTags.map((tag: string) => sanitizeString(tag)) : null;

    // Validation
    if (!title || !file_name || !file_path || !uploader_id || !college_domain) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('notes')
      .insert({
        title,
        description: description || null,
        subject_id: subject_id || null,
        uploader_id,
        file_name,
        file_path,
        file_size: parseInt(file_size),
        file_type,
        mime_type,
        semester: semester || null,
        year_of_study: year_of_study || 1,
        tags: tags || null,
        visibility: visibility || 'public',
        college_domain,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ note: data }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}