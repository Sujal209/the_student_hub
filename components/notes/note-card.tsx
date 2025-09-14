'use client';

import React, { useState } from 'react';
import { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { getSignedUrl } from '@/lib/supabaseClient';
import { formatBytes, formatRelativeTime, getFileIcon, getFileTypeColor } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Eye, 
  Calendar,
  User,
  Tag,
  BookOpen,
  Loader2
} from 'lucide-react';

type Note = Database['public']['Tables']['notes']['Row'] & {
  uploader_name: string;
  subject_name: string;
  subject_color: string;
};

interface NoteCardProps {
  note: Note;
  onUpdate?: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onUpdate }) => {
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setDownloading(true);

    try {
      const signedUrl = await getSignedUrl(note.file_path, 3600);
      
      if (!signedUrl) {
        throw new Error('Unable to generate download link');
      }

      // Create download link
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = note.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Track download (you could call an API here)
      toast({
        title: 'Download Started',
        description: `Downloading ${note.title}`,
      });

    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to download file',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };

  const handlePreview = async () => {
    try {
      const signedUrl = await getSignedUrl(note.file_path, 3600);
      
      if (!signedUrl) {
        throw new Error('Unable to generate preview link');
      }

      // Open in new tab
      window.open(signedUrl, '_blank');
    } catch (error: any) {
      console.error('Error previewing file:', error);
      toast({
        title: 'Preview Failed',
        description: error.message || 'Failed to preview file',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="note-card group">
      <div className="flex items-start space-x-3 mb-3">
        <div 
          className="w-3 h-3 rounded-full mt-2"
          style={{ backgroundColor: note.subject_color }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {note.title}
          </h3>
          {note.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {note.description}
            </p>
          )}
        </div>
      </div>

      {/* File info */}
      <div className="flex items-center space-x-2 mb-3">
        <div className={`px-2 py-1 rounded text-xs font-medium border ${getFileTypeColor(note.file_type)}`}>
          <span className="mr-1">{getFileIcon(note.file_type)}</span>
          {note.file_type.toUpperCase()}
        </div>
        <span className="text-xs text-muted-foreground">
          {formatBytes(note.file_size)}
        </span>
      </div>

      {/* Metadata */}
      <div className="space-y-2 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center">
          <BookOpen className="h-3 w-3 mr-1" />
          <span>{note.subject_name}</span>
        </div>
        
        <div className="flex items-center">
          <User className="h-3 w-3 mr-1" />
          <span>{note.uploader_name}</span>
        </div>

        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{formatRelativeTime(note.created_at)}</span>
        </div>

        {note.semester && (
          <div className="flex items-center">
            <Tag className="h-3 w-3 mr-1" />
            <span>{note.semester} • Year {note.year_of_study}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs">
                +{note.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        {note.file_type === 'pdf' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        )}
        
        <Button
          onClick={handleDownload}
          disabled={downloading}
          size="sm"
          className="flex-1"
        >
          {downloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-1" />
              Download
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{note.download_count} downloads</span>
          {note.is_verified && (
            <span className="text-primary font-medium">✓ Verified</span>
          )}
        </div>
      </div>
    </div>
  );
};