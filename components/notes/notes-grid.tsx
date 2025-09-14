'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/database';
import { NoteCard } from './note-card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, AlertCircle } from 'lucide-react';

// Simple in-memory cache to speed up repeated views/searches
const notesCache = new Map<string, any[]>();

type Note = Database['public']['Tables']['notes']['Row'] & {
  uploader_name: string;
  subject_name: string;
  subject_color: string;
};

interface NotesGridProps {
  searchMode?: boolean;
  searchQuery?: string;
  filters?: {
    subject_id?: string;
    tags?: string[];
    semester?: string;
    year?: number;
  };
}

// Escape % and _ for ILIKE patterns
const escapeLike = (str: string) => str.replace(/[%_]/g, '\\$&');

const makeCacheKey = (
  collegeDomain: string | undefined,
  searchMode: boolean,
  searchQuery: string,
  filters: NotesGridProps['filters'],
  page: number,
) => {
  return JSON.stringify({ collegeDomain, searchMode, searchQuery, filters, page });
};

// Columns we select for both main fetch and random suggestions (with joins)
const SELECT_COLUMNS = `
  id, title, description, subject_id, uploader_id, file_name, file_path, file_size, file_type, mime_type,
  semester, year_of_study, tags, visibility, college_domain, download_count, is_verified, is_flagged,
  flag_reason, flagged_by, flagged_at, created_at, updated_at,
  uploader:users!notes_uploader_id_fkey (full_name, email),
  subject:subjects!notes_subject_id_fkey (name, color)
`;

export const NotesGrid: React.FC<NotesGridProps> = ({ 
  searchMode = false,
  searchQuery = '',
  filters = {}
}) => {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [randomNotes, setRandomNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const NOTES_PER_PAGE = 12;

  // Map joined rows into Note objects
  const mapRows = (rows: any[]): Note[] => {
    return (rows || []).map((n: any) => {
      const uploaderName = n?.uploader?.full_name || n?.uploader?.email?.split('@')[0] || 'Anonymous';
      const subjectName = n?.subject?.name || 'General';
      const subjectColor = n?.subject?.color || '#3B82F6';
      const { uploader, subject, ...noteFields } = n;
      return {
        ...noteFields,
        uploader_name: uploaderName,
        subject_name: subjectName,
        subject_color: subjectColor,
      } as Note;
    });
  };

  // Fetch a quick set of random notes (recent + client-side shuffle)
  const fetchRandomNotes = async () => {
    try {
      let q = supabase
        .from('notes')
        .select(SELECT_COLUMNS)
        .in('visibility', ['public', 'college_only'])
        .order('created_at', { ascending: false })
        .limit(24);

      if (profile?.college_domain) {
        q = q.eq('college_domain', profile.college_domain);
      }

      const { data, error: rndError } = await q;
      if (rndError || !data) return;

      const arr = mapRows(data);
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setRandomNotes(arr.slice(0, NOTES_PER_PAGE));
    } catch {
      // ignore
    }
  };

  const fetchNotes = async (pageNumber: number, reset: boolean = false) => {
    setLoading(true);
    try {
      setError(null);

      // Serve from cache for first page queries when possible
      const cacheKey = makeCacheKey(profile?.college_domain, searchMode, searchQuery.trim(), filters, pageNumber);
      if (reset && pageNumber === 0 && notesCache.has(cacheKey)) {
        const cached = notesCache.get(cacheKey)! as Note[];
        setNotes(cached);
        setHasMore(cached.length === NOTES_PER_PAGE);
        return;
      }

      // Build base query with joined relations to avoid N+1 requests
      let query = supabase
        .from('notes')
        .select(SELECT_COLUMNS)
        .in('visibility', ['public', 'college_only'])
        .order('created_at', { ascending: false })
        .range(pageNumber * NOTES_PER_PAGE, (pageNumber + 1) * NOTES_PER_PAGE - 1);

      // Filter by college domain if available
      if (profile?.college_domain) {
        query = query.eq('college_domain', profile.college_domain);
      }

      // Apply filters
      if (filters.subject_id) {
        query = query.eq('subject_id', filters.subject_id);
      }
      if (filters.semester) {
        query = query.eq('semester', filters.semester);
      }
      if (typeof filters.year === 'number') {
        query = query.eq('year_of_study', filters.year);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      // Apply search if in search mode (use ILIKE fallback for now)
      if (searchMode && searchQuery.trim()) {
        const q = escapeLike(searchQuery.trim());
        query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      // Map joined data into Note shape
      const formattedNotes: Note[] = mapRows(data);

      if (reset) {
        setNotes(formattedNotes);
        // Cache first page results for instant back/forward between tabs
        if (pageNumber === 0) {
          notesCache.set(cacheKey, formattedNotes);
        }
      } else {
        setNotes((prev) => [...prev, ...formattedNotes]);
      }

      setHasMore(formattedNotes.length === NOTES_PER_PAGE);
    } catch (err: any) {
      console.error('Error fetching notes:', err);
      setError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    // Clear cache for this key if query/filters changed (to avoid stale results)
    const cacheKey = makeCacheKey(profile?.college_domain, searchMode, searchQuery.trim(), filters, 0);
    notesCache.delete(cacheKey);
    // Fetch random suggestions immediately so UI is not empty
    setRandomNotes([]);
    fetchRandomNotes();
    fetchNotes(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.college_domain, searchQuery, JSON.stringify(filters)]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotes(nextPage);
  };

  // While loading the first page, prefer showing random notes instead of a spinner
  if (loading && notes.length === 0) {
    if (randomNotes.length > 0) {
      return (
        <div className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Showing random notes while we fetch your results...
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {randomNotes.map((note) => (
              <NoteCard key={`rnd-${note.id}`} note={note} onUpdate={() => fetchNotes(0, true)} />
            ))}
          </div>
        </div>
      );
    }
    // Fallback spinner if we couldn't get random notes quickly
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading notes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Notes</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => fetchNotes(0, true)}>
          Try Again
        </Button>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Notes Found</h3>
        <p className="text-muted-foreground mb-4">
          {searchMode 
            ? 'Try adjusting your search terms or filters'
            : 'Upload your first note to start sharing knowledge with your classmates!'
          }
        </p>
        <div className="text-sm text-muted-foreground mt-2">
          <p>💡 Tips for uploading:</p>
          <ul className="mt-2 space-y-1">
            <li>• Upload PDF, DOCX, PPTX files</li>
            <li>• Add descriptive titles and tags</li>
            <li>• Choose appropriate subjects</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onUpdate={() => fetchNotes(0, true)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <Button 
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load More Notes'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
