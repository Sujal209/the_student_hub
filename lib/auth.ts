import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';
import { Database } from '@/types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];

export interface AuthUser extends User {
  profile?: UserProfile;
}

// Sign up with email and password
export const signUp = async (email: string, password: string, metadata?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) throw error;
  return data;
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

// Sign in with Google OAuth
export const signInWithGoogle = async (redirectTo?: string) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw error;
  return data;
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Get current user with profile data
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  try {
    // Fetch user profile from our users table
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.warn('Could not fetch user profile:', error);
    }

    return {
      ...user,
      profile: profile || undefined,
    };
  } catch (error) {
    console.warn('Error fetching user profile:', error);
    return {
      ...user,
      profile: undefined,
    };
  }
};

// Update user profile
export const updateProfile = async (
  userId: string,
  updates: Partial<Database['public']['Tables']['users']['Update']>
) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Check if user email belongs to a college domain
export const validateCollegeEmail = (email: string): boolean => {
  const domain = email.split('@')[1];
  if (!domain) return false;

  // Common patterns for educational institutions
  const eduPatterns = [
    /\.edu$/,           // US educational institutions
    /\.edu\./,          // US educational institutions with subdomain
    /\.ac\./,           // Academic institutions (UK, Australia, etc.)
    /\.edu\.au$/,       // Australian universities
    /\.edu\.ca$/,       // Canadian universities
    /\.ac\.uk$/,        // UK universities
    /\.uni-.*\.de$/,    // German universities
    /\.univ-.*\.fr$/,   // French universities
  ];

  return eduPatterns.some(pattern => pattern.test(domain.toLowerCase()));
};

// Extract college domain from email
export const getCollegeDomainFromEmail = (email: string): string | null => {
  const domain = email.split('@')[1];
  return domain ? domain.toLowerCase() : null;
};

// Verify user's college email
export const verifyCollegeEmail = async (userId: string, collegeEmail: string) => {
  if (!validateCollegeEmail(collegeEmail)) {
    throw new Error('Invalid college email format');
  }

  const collegeDomain = getCollegeDomainFromEmail(collegeEmail);
  
  const { data, error } = await supabase
    .from('users')
    .update({
      college_email: collegeEmail,
      college_domain: collegeDomain,
      is_verified: true,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Reset password
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) throw error;
  return data;
};

// Update password
export const updatePassword = async (password: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) throw error;
  return data;
};

// Check if current user has admin privileges
export const checkAdminAccess = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  const { data: profile } = await supabase
    .from('users')
    .select('user_role')
    .eq('id', user.id)
    .single();

  return profile?.user_role === 'admin';
};

// Get user's college configuration
export const getCollegeConfig = async (collegeDomain?: string) => {
  let domain = collegeDomain;
  
  if (!domain) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('users')
      .select('college_domain')
      .eq('id', user.id)
      .single();

    domain = profile?.college_domain;
  }

  if (!domain) return null;

  const { data: config } = await supabase
    .from('college_configs')
    .select('*')
    .eq('domain', domain)
    .eq('is_active', true)
    .single();

  return config;
};

// Create or update user profile on sign up
export const createUserProfile = async (user: User, additionalData?: any) => {
  const collegeEmail = user.email;
  const collegeDomain = collegeEmail ? getCollegeDomainFromEmail(collegeEmail) : null;
  const isCollegeEmail = collegeEmail ? validateCollegeEmail(collegeEmail) : false;

  const profileData: Database['public']['Tables']['users']['Insert'] = {
    id: user.id,
    email: user.email!,
    full_name: user.user_metadata?.full_name || user.email!.split('@')[0],
    avatar_url: user.user_metadata?.avatar_url || null,
    college_email: isCollegeEmail ? collegeEmail : null,
    college_domain: collegeDomain,
    is_verified: isCollegeEmail,
    ...additionalData,
  };

  const { data, error } = await supabase
    .from('users')
    .upsert(profileData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update last login timestamp
export const updateLastLogin = async (userId: string) => {
  try {
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);
  } catch (error) {
    console.warn('Could not update last login:', error);
    // Don't throw error - this shouldn't break authentication
  }
};

// Auth state change listener
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

// Check if user has access to a specific college's content
export const checkCollegeAccess = async (targetCollegeDomain: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  const { data: profile } = await supabase
    .from('users')
    .select('college_domain, user_role')
    .eq('id', user.id)
    .single();

  if (!profile) return false;

  // Admins can access any content in their college
  if (profile.user_role === 'admin' && profile.college_domain === targetCollegeDomain) {
    return true;
  }

  // Regular users can only access content from their own college
  return profile.college_domain === targetCollegeDomain;
};

// Generate a secure verification token
export const generateVerificationToken = (): string => {
  return crypto.randomUUID();
};

// Get user permissions for note actions
export const getUserPermissions = async (noteId?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      canView: false,
      canEdit: false,
      canDelete: false,
      canDownload: false,
      canReport: false,
      canModerate: false,
    };
  }

  const { data: profile } = await supabase
    .from('users')
    .select('user_role, college_domain')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.user_role === 'admin';
  let isOwner = false;

  if (noteId) {
    const { data: note } = await supabase
      .from('notes')
      .select('uploader_id, college_domain')
      .eq('id', noteId)
      .single();

    isOwner = note?.uploader_id === user.id;
  }

  return {
    canView: true, // Basic viewing permission
    canEdit: isOwner, // Only owner can edit
    canDelete: isOwner || isAdmin, // Owner or admin can delete
    canDownload: true, // All authenticated users can download
    canReport: true, // All authenticated users can report
    canModerate: isAdmin, // Only admins can moderate
    isAdmin,
    isOwner,
  };
};