'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuthForm } from '@/components/auth/auth-form';

export const Landing: React.FC = () => {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const collegeName = process.env.NEXT_PUBLIC_COLLEGE_NAME || 'Your College';
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Student Notes Hub';
  const logoUrl = process.env.NEXT_PUBLIC_BRAND_LOGO_URL;

  const handleGetStarted = () => {
    setAuthMode('signup');
    setShowAuthForm(true);
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuthForm(true);
  };

  if (showAuthForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt={`${collegeName} Logo`}
                className="h-16 w-auto mx-auto mb-4"
              />
            )}
            <h1 className="text-2xl font-bold text-gradient">{appName}</h1>
            <p className="text-muted-foreground mt-2">{collegeName}</p>
          </div>
          
          <AuthForm 
            mode={authMode}
            onModeChange={setAuthMode}
            onBack={() => setShowAuthForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt={`${collegeName} Logo`}
                className="h-8 w-auto"
              />
            )}
            <h1 className="text-xl font-bold">{appName}</h1>
          </div>
          <Button variant="ghost" onClick={handleSignIn}>
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
            Share Knowledge,<br />Excel Together
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Access and share study notes with your fellow students at {collegeName}. 
            Upload your notes, discover new resources, and collaborate for academic success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={handleSignIn} className="text-lg px-8 py-6">
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Why Students Love Our Platform</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">Rich Content Library</h4>
              <p className="text-muted-foreground">Access notes, presentations, and study materials across all subjects and semesters.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">Smart Search</h4>
              <p className="text-muted-foreground">Find exactly what you need with our powerful search and filtering system.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">Secure & Private</h4>
              <p className="text-muted-foreground">Your data is protected with enterprise-grade security and college-only access.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h4 className="text-lg font-semibold mb-2">Sign Up</h4>
                <p className="text-muted-foreground">Create your account using your {collegeName} email address.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h4 className="text-lg font-semibold mb-2">Upload & Share</h4>
                <p className="text-muted-foreground">Upload your study notes and help your classmates succeed.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h4 className="text-lg font-semibold mb-2">Discover & Download</h4>
                <p className="text-muted-foreground">Explore notes from other students and download what you need.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-xl text-muted-foreground mb-8">
            Join hundreds of {collegeName} students already sharing knowledge and succeeding together.
          </p>
          <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6">
            Create Your Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt={`${collegeName} Logo`}
                  className="h-6 w-auto"
                />
              )}
              <span className="font-medium">{appName}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 {collegeName}. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};