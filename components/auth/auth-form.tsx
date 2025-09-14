'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signIn, signUp, signInWithGoogle } from '@/lib/auth';
import { validateEmail } from '@/lib/utils';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
  onBack?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ 
  mode, 
  onModeChange, 
  onBack 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isSignUp = mode === 'signup';
  const collegeDomain = process.env.NEXT_PUBLIC_COLLEGE_DOMAIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (collegeDomain && !email.toLowerCase().endsWith(`@${collegeDomain.toLowerCase()}`)) {
        throw new Error(`Please use your ${collegeDomain} email address`);
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (!fullName.trim()) {
          throw new Error('Please enter your full name');
        }

        // Sign up
        await signUp(email, password, {
          full_name: fullName.trim(),
        });

        setSuccess('Account created! Please check your email to verify your account.');
        
        // Clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
      } else {
        // Sign in
        await signIn(email, password);
        // Will redirect via auth provider
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {isSignUp 
            ? 'Join your fellow students in sharing knowledge' 
            : 'Sign in to access your notes and resources'
          }
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required={isSignUp}
              disabled={loading}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">
            Email Address
            {collegeDomain && (
              <span className="text-sm text-muted-foreground ml-1">
                (@{collegeDomain})
              </span>
            )}
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={collegeDomain ? `student@${collegeDomain}` : "Enter your email"}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={loading}
            minLength={6}
          />
        </div>

        {isSignUp && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required={isSignUp}
              disabled={loading}
              minLength={6}
            />
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="loading-spinner mr-2" />
              {isSignUp ? 'Creating Account...' : 'Signing In...'}
            </>
          ) : (
            isSignUp ? 'Create Account' : 'Sign In'
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full" 
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => onModeChange(isSignUp ? 'signin' : 'signup')}
          className="text-sm text-primary hover:underline"
          disabled={loading}
        >
          {isSignUp 
            ? 'Already have an account? Sign in' 
            : "Don't have an account? Sign up"
          }
        </button>
      </div>

      {onBack && (
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-muted-foreground hover:text-foreground"
            disabled={loading}
          >
            ← Back to home
          </button>
        </div>
      )}
    </div>
  );
};