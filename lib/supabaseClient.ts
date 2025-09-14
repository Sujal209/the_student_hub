import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for browser/client-side operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Admin client for server-side operations (use with caution)
export const createAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Helper function to get the current user's college domain
export const getUserCollegeDomain = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: userData } = await supabase
    .from('users')
    .select('college_domain')
    .eq('id', user.id)
    .single();

  return userData?.college_domain || null;
};

// Helper function to extract college domain from email
export const extractCollegeDomainFromEmail = (email: string): string | null => {
  const emailParts = email.split('@');
  if (emailParts.length !== 2) return null;
  
  const domain = emailParts[1].toLowerCase();
  
  // Common college domain patterns
  const collegePatterns = [
    /\.edu$/,
    /\.ac\./,
    /\.edu\./,
  ];

  const isCollegeDomain = collegePatterns.some(pattern => pattern.test(domain));
  return isCollegeDomain ? domain : null;
};

// Helper function to check if user is admin
export const isUserAdmin = async (userId?: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  const targetUserId = userId || user?.id;
  
  if (!targetUserId) return false;

  const { data: userData } = await supabase
    .from('users')
    .select('user_role')
    .eq('id', targetUserId)
    .single();

  return userData?.user_role === 'admin';
};

// Helper function to get signed URL for file download
export const getSignedUrl = async (path: string, expiresIn: number = 3600): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('student-notes')
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error creating signed URL:', error);
    return null;
  }
};

// Helper function to upload file to Supabase storage
export const uploadFile = async (
  file: File,
  path: string,
  options?: { upsert?: boolean }
): Promise<{ data: any; error: any }> => {
  return await supabase.storage
    .from('student-notes')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: options?.upsert || false,
    });
};

// Helper function to delete file from Supabase storage
export const deleteFile = async (path: string): Promise<{ error: any }> => {
  return await supabase.storage
    .from('student-notes')
    .remove([path]);
};

// Helper function to get public URL (for public files only)
export const getPublicUrl = (path: string): string => {
  const { data } = supabase.storage
    .from('student-notes')
    .getPublicUrl(path);

  return data.publicUrl;
};

// Helper function to validate file type and size
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'); // 10MB default
  const allowedTypes = (process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || 'pdf,docx,pptx,jpg,jpeg,png,gif')
    .split(',')
    .map(type => type.trim());

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds ${Math.round(maxSize / 1048576)}MB limit`
    };
  }

  // Check file type
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!allowedTypes.includes(fileExtension)) {
    return {
      isValid: false,
      error: `File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  return { isValid: true };
};

// Helper function to generate unique file path
export const generateFilePath = (userId: string, fileName: string, collegeId?: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = fileName.split('.').pop();
  const safeName = fileName
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars with underscore
    .substring(0, 50); // Limit length
  
  const collegePrefix = collegeId ? `${collegeId}/` : '';
  return `${collegePrefix}${userId}/${timestamp}_${randomString}_${safeName}.${fileExtension}`;
};

// Health check function for Supabase connection
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};