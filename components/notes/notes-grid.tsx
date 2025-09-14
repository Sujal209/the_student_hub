'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/database';
import { NoteCard } from './note-card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, AlertCircle } from 'lucide-react';

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

export const NotesGrid: React.FC<NotesGridProps> = ({ 
  searchMode = false,
  searchQuery = '',
  filters = {}
}) => {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const NOTES_PER_PAGE = 12;

  const fetchNotes = async (pageNumber: number, reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('notes')
        .select('*')
        .eq('status', 'active')
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
      if (filters.year) {
        query = query.eq('year_of_study', filters.year);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      // Apply search if in search mode
      if (searchMode && searchQuery) {
        query = query.textSearch('title', searchQuery);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Fetch user details for each note
      const formattedNotes: Note[] = [];
      
      for (const note of data || []) {
        let uploaderName = 'Anonymous';
        let subjectName = 'General';
        
        try {
          // Fetch uploader info
          if (note.uploader_id) {
            const { data: userData } = await supabase
              .from('users')
              .select('full_name, email')
              .eq('id', note.uploader_id)
              .single();
            
            if (userData) {
              uploaderName = userData.full_name || userData.email?.split('@')[0] || 'Anonymous';
            }
          }
          
          // Fetch subject info
          if (note.subject_id) {
            const { data: subjectData } = await supabase
              .from('subjects')
              .select('name')
              .eq('id', note.subject_id)
              .single();
              
            if (subjectData) {
              subjectName = subjectData.name;
            }
          }
        } catch (err) {
          console.warn('Error fetching related data:', err);
        }
        
        formattedNotes.push({
          ...note,
          uploader_name: uploaderName,
          subject_name: subjectName,
          subject_color: '#3B82F6'
        });
      }

      if (reset) {
        setNotes(formattedNotes);
      } else {
        setNotes(prev => [...prev, ...formattedNotes]);
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
    fetchNotes(0, true);
  }, [profile?.college_domain, searchQuery, filters]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotes(nextPage);
  };

  if (loading && notes.length === 0) {
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