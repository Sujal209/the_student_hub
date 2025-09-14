'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { AuthUser, getCurrentUser, updateLastLogin } from '@/lib/auth';
import { Database } from '@/types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setProfile(currentUser?.profile || null);
    } catch (error) {
      console.warn('Error refreshing profile (database may need setup):', error);
      // Don't set user to null on profile errors - keep the auth user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({ id: authUser.id, email: authUser.email || '', profile: null });
      }
      setProfile(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            setProfile(currentUser?.profile || null);
            
            // Update last login
            if (currentUser) {
              try {
                await updateLastLogin(currentUser.id);
              } catch (error) {
                console.warn('Failed to update last login:', error);
              }
            }
          } catch (error) {
            console.warn('Database not ready, using basic auth:', error);
            setUser({ id: session.user.id, email: session.user.email || '', profile: null });
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            setProfile(currentUser?.profile || null);
            
            // Update last login
            if (currentUser) {
              try {
                await updateLastLogin(currentUser.id);
              } catch (error) {
                console.warn('Failed to update last login:', error);
              }
            }
          } catch (error) {
            console.error('Error handling sign in:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Optionally refresh profile data
          await refreshProfile();
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signOut: handleSignOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};