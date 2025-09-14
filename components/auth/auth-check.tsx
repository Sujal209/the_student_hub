'use client';

import React from 'react';
import { useAuth } from '@/components/providers/auth-provider';

interface AuthCheckProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  loading?: React.ReactNode;
  requireVerified?: boolean;
}

export const AuthCheck: React.FC<AuthCheckProps> = ({ 
  children, 
  fallback, 
  loading, 
  requireVerified = false 
}) => {
  const { user, profile, loading: authLoading } = useAuth();

  // Show loading state
  if (authLoading) {
    return loading ? <>{loading}</> : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  // Not authenticated
  if (!user || !profile) {
    return <>{fallback}</>;
  }

  // Check if verification is required and user is not verified
  if (requireVerified && !profile.is_verified) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-4">Email Verification Required</h2>
          <p className="text-muted-foreground mb-4">
            Please verify your college email address to access the platform.
          </p>
          <p className="text-sm text-muted-foreground">
            Check your email for a verification link or contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  // Authenticated and verified (if required)
  return <>{children}</>;
};