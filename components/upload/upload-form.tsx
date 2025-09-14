'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase, uploadFile, validateFile, generateFilePath } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  X, 
  Loader2,
  CheckCircle
} from 'lucide-react';
import { formatBytes } from '@/lib/utils';

interface UploadFormData {
  title: string;
  description: string;
  subject_id: string;
  semester: string;
  year_of_study: number;
  tags: string[];
  visibility: 'public' | 'private' | 'college_only';
}

export const UploadForm: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    description: '',
    subject_id: '',
    semester: '',
    year_of_study: 1,
    tags: [],
    visibility: 'public',
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles: File[] = [];
    
    acceptedFiles.forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        toast({
          title: 'Invalid File',
          description: `${file.name}: ${validation.error}`,
          variant: 'destructive',
        });
      }
    });

    setFiles(prev => [...prev, ...validFiles]);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
    },
    maxSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'),
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (field: keyof UploadFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    handleInputChange('tags', tags);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to upload files',
        variant: 'destructive',
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one file to upload',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a title for your notes',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    const uploadPromises = [];

    try {
      for (const file of files) {
        const collegeDomain = profile?.college_domain || 'general';
        const filePath = generateFilePath(user.id, file.name, collegeDomain);
        
        uploadPromises.push(
          (async () => {
            console.log('Uploading file:', file.name, 'to path:', filePath);
            
            // Upload file to storage
            const { data: uploadData, error: uploadError } = await uploadFile(file, filePath);
            
            if (uploadError) {
              console.error('Upload error:', uploadError);
              throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
            }

            console.log('File uploaded successfully, creating database record...');
            
            // Create note record in database
            const noteData = {
              title: formData.title,
              description: formData.description || null,
              subject_id: formData.subject_id || null,
              uploader_id: user.id,
              file_name: file.name,
              file_path: filePath,
              file_size: file.size,
              file_type: file.name.split('.').pop()?.toLowerCase() as any,
              mime_type: file.type,
              semester: formData.semester || null,
              year_of_study: formData.year_of_study,
              tags: formData.tags.length > 0 ? formData.tags : null,
              visibility: formData.visibility,
              college_domain: collegeDomain,
            };
            
            console.log('Inserting note data:', noteData);
            
            const { error: dbError } = await supabase
              .from('notes')
              .insert(noteData);

            if (dbError) {
              console.error('Database error:', dbError);
              throw new Error(`Failed to save note metadata: ${dbError.message}`);
            }

            console.log('Note saved successfully!');
            return { file: file.name, success: true };
          })()
        );
      }

      const results = await Promise.allSettled(uploadPromises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (successful > 0) {
        toast({
          title: 'Upload Complete! 🎉',
          description: `Successfully uploaded ${successful} file${successful > 1 ? 's' : ''}${
            failed > 0 ? ` (${failed} failed)` : ''
          }. Go to Browse Notes to see your upload!`,
        });

        // Reset form
        setFiles([]);
        setFormData({
          title: '',
          description: '',
          subject_id: '',
          semester: '',
          year_of_study: 1,
          tags: [],
          visibility: 'public',
        });
      }

      if (failed > 0 && successful === 0) {
        throw new Error(`All uploads failed`);
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload files',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div>
          <Label className="text-base font-medium mb-3 block">Upload Files</Label>
          <div
            {...getRootProps()}
            className={`upload-dropzone cursor-pointer ${
              isDragActive ? 'dragover' : ''
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-lg mb-2">Drop files here...</p>
              ) : (
                <p className="text-lg mb-2">
                  Drag & drop files here, or <span className="text-primary">click to browse</span>
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOCX, PPTX, and images up to{' '}
                {formatBytes(parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'))}
              </p>
            </div>
          </div>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-2">
            <Label className="text-base font-medium">Selected Files</Label>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter a descriptive title for your notes"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe what these notes cover..."
            rows={3}
          />
        </div>

        {/* Subject and Academic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <Input
              id="semester"
              value={formData.semester}
              onChange={(e) => handleInputChange('semester', e.target.value)}
              placeholder="e.g., Fall 2024"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="year">Year of Study</Label>
            <Select
              value={formData.year_of_study.toString()}
              onValueChange={(value) => handleInputChange('year_of_study', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Year 1</SelectItem>
                <SelectItem value="2">Year 2</SelectItem>
                <SelectItem value="3">Year 3</SelectItem>
                <SelectItem value="4">Year 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            value={formData.tags.join(', ')}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="e.g., exam-prep, lecture-notes, tutorial"
          />
          <p className="text-xs text-muted-foreground">
            Separate tags with commas to help others find your notes
          </p>
        </div>

        {/* Visibility */}
        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
          <Select
            value={formData.visibility}
            onValueChange={(value: any) => handleInputChange('visibility', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public - Visible to all students</SelectItem>
              <SelectItem value="college_only">College Only - Visible to your college</SelectItem>
              <SelectItem value="private">Private - Only visible to you</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={uploading || files.length === 0}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Uploading {files.length} file{files.length > 1 ? 's' : ''}...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''}` : 'Files'}
            </>
          )}
        </Button>
      </form>
    </div>
  );
};