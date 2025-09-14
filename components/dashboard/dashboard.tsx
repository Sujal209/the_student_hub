'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { NotesGrid } from '@/components/notes/notes-grid';
import { UploadForm } from '@/components/upload/upload-form';
import { SearchBar } from '@/components/notes/search-bar';
import { ProfilePanel } from '@/components/profile/profile-panel';
import { 
  BookOpen, 
  Upload, 
  Search, 
  User, 
  Menu,
  X,
  LogOut
} from 'lucide-react';

type DashboardView = 'browse' | 'upload' | 'profile' | 'search';

export const Dashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('browse');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const collegeName = process.env.NEXT_PUBLIC_COLLEGE_NAME || 'Your College';
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Student Notes Hub';
  const logoUrl = process.env.NEXT_PUBLIC_BRAND_LOGO_URL;

  const navigation = [
    {
      id: 'browse' as DashboardView,
      name: 'Browse Notes',
      icon: BookOpen,
      description: 'Discover and download study materials'
    },
    {
      id: 'search' as DashboardView,
      name: 'Search',
      icon: Search,
      description: 'Find specific notes and resources'
    },
    {
      id: 'upload' as DashboardView,
      name: 'Upload Notes',
      icon: Upload,
      description: 'Share your study materials'
    },
    {
      id: 'profile' as DashboardView,
      name: 'Profile',
      icon: User,
      description: 'Manage your account and uploads'
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'browse':
        return <NotesGrid />;
      case 'search':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Search Notes</h2>
              <p className="text-muted-foreground mb-8">
                Find exactly what you need from thousands of study materials
              </p>
            </div>
            <SearchBar />
            <NotesGrid searchMode={true} />
          </div>
        );
      case 'upload':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Share Your Knowledge</h2>
              <p className="text-muted-foreground">
                Upload your study notes to help fellow students succeed
              </p>
            </div>
            <UploadForm />
          </div>
        );
      case 'profile':
        return <ProfilePanel />;
      default:
        return <NotesGrid />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt={`${collegeName} Logo`}
                className="h-8 w-auto"
              />
            )}
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold">{appName}</h1>
              <p className="text-xs text-muted-foreground">{collegeName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="text-sm">
                <p className="font-medium">{profile?.full_name || user?.email}</p>
                {profile?.user_role === 'admin' && (
                  <p className="text-xs text-primary">Admin</p>
                )}
              </div>
            </div>
            
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0 md:inset-y-auto md:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto py-6">
              <nav className="space-y-2 px-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors
                        ${isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs opacity-75">{item.description}</div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* User info in sidebar for mobile */}
            <div className="border-t p-4 md:hidden">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium">
                  {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {profile?.full_name || user?.email}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-muted-foreground">
                      {collegeName}
                    </p>
                    {profile?.user_role === 'admin' && (
                      <span className="text-xs text-primary font-medium">Admin</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="container mx-auto px-4 py-8">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};