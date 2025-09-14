import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { path, expiresIn = 3600 } = await request.json();

    if (!path) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    // Validate path to prevent path traversal
    if (path.includes('..') || path.includes('//') || !/^[a-zA-Z0-9/_.-]+$/.test(path)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    // Use admin client to generate signed URL
    const supabase = createAdminClient();

    const { data, error } = await supabase.storage
      .from('student-notes')
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', { message: error.message, code: error.code });
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      signedUrl: data.signedUrl
    });

  } catch (error: any) {
    console.error('Error in signed URL API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}