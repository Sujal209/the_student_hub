import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthForm } from './auth-form';
import { signIn, signUp, signInWithGoogle } from '@/lib/auth';

// Mock the auth library
jest.mock('@/lib/auth', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  signInWithGoogle: jest.fn(),
}));

// Mock the utils
jest.mock('@/lib/utils', () => ({
  validateEmail: jest.fn((email: string) => email.includes('@')),
}));

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
const mockSignUp = signUp as jest.MockedFunction<typeof signUp>;
const mockSignInWithGoogle = signInWithGoogle as jest.MockedFunction<typeof signInWithGoogle>;

const defaultProps = {
  mode: 'signin' as const,
  onModeChange: jest.fn(),
  onBack: jest.fn(),
};

describe('AuthForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sign In Mode', () => {
    it('renders sign in form correctly', () => {
      render(<AuthForm {...defaultProps} mode="signin" />);
      
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to access your notes and resources')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });

    it('handles successful sign in', async () => {
      mockSignIn.mockResolvedValueOnce({ user: null, session: null });
      
      render(<AuthForm {...defaultProps} mode="signin" />);
      
      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('shows error for invalid email', async () => {
      render(<AuthForm {...defaultProps} mode="signin" />);
      
      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'invalid-email' }
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });
  });

  describe('Sign Up Mode', () => {
    it('renders sign up form correctly', () => {
      render(<AuthForm {...defaultProps} mode="signup" />);
      
      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByText('Join your fellow students in sharing knowledge')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    });

    it('handles successful sign up', async () => {
      mockSignUp.mockResolvedValueOnce({ user: null, session: null });
      
      render(<AuthForm {...defaultProps} mode="signup" />);
      
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText('Email Address'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password'), {
        target: { value: 'password123' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
      
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123', {
          full_name: 'Test User'
        });
      });
    });

    it('shows error for password mismatch', async () => {
      render(<AuthForm {...defaultProps} mode="signup" />);
      
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText('Confirm Password'), {
        target: { value: 'different-password' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });
  });

  describe('Google Sign In', () => {
    it('handles Google sign in', async () => {
      mockSignInWithGoogle.mockResolvedValueOnce({ data: null, error: null });
      
      render(<AuthForm {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Continue with Google'));
      
      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalled();
      });
    });
  });

  describe('Mode Switching', () => {
    it('switches between sign in and sign up modes', () => {
      const mockOnModeChange = jest.fn();
      
      render(<AuthForm {...defaultProps} onModeChange={mockOnModeChange} mode="signin" />);
      
      fireEvent.click(screen.getByText("Don't have an account? Sign up"));
      
      expect(mockOnModeChange).toHaveBeenCalledWith('signup');
    });
  });
});