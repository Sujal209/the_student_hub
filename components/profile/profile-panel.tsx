'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '@/lib/auth';
import { User, Mail, BookOpen, Calendar, Edit3, Save, X } from 'lucide-react';

export const ProfilePanel: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    year_of_study: profile?.year_of_study || 1,
    major: profile?.major || '',
  });

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      await updateProfile(user.id, formData);
      await refreshProfile();
      
      setEditing(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
      year_of_study: profile?.year_of_study || 1,
      major: profile?.major || '',
    });
    setEditing(false);
  };

  const collegeName = process.env.NEXT_PUBLIC_COLLEGE_NAME || 'Your College';

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4">
          {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {editing ? 'Edit Profile' : profile?.full_name || user?.email}
        </h2>
        <p className="text-muted-foreground">{collegeName}</p>
      </div>

      {/* Profile Information */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Profile Information</h3>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Email (Read-only) */}
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>

          {/* Full Name */}
          <div className="flex items-start space-x-3">
            <User className="h-5 w-5 text-muted-foreground mt-1" />
            <div className="flex-1">
              <Label htmlFor="full_name">Full Name</Label>
              {editing ? (
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="mt-1"
                />
              ) : (
                <p className="font-medium mt-1">{profile?.full_name || 'Not provided'}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="flex items-start space-x-3">
            <BookOpen className="h-5 w-5 text-muted-foreground mt-1" />
            <div className="flex-1">
              <Label htmlFor="bio">Bio</Label>
              {editing ? (
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-muted-foreground">
                  {profile?.bio || 'No bio provided'}
                </p>
              )}
            </div>
          </div>

          {/* Academic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Year of Study */}
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
              <div className="flex-1">
                <Label htmlFor="year_of_study">Year of Study</Label>
                {editing ? (
                  <select
                    id="year_of_study"
                    value={formData.year_of_study}
                    onChange={(e) => setFormData(prev => ({ ...prev, year_of_study: parseInt(e.target.value) }))}
                    className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                ) : (
                  <p className="font-medium mt-1">Year {profile?.year_of_study || 1}</p>
                )}
              </div>
            </div>

            {/* Major */}
            <div className="flex items-start space-x-3">
              <BookOpen className="h-5 w-5 text-muted-foreground mt-1" />
              <div className="flex-1">
                <Label htmlFor="major">Major</Label>
                {editing ? (
                  <Input
                    id="major"
                    value={formData.major}
                    onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
                    placeholder="e.g., Computer Science"
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium mt-1">{profile?.major || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Account Status</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.is_verified 
                    ? 'Verified college student' 
                    : 'Email verification pending'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  profile?.is_verified ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className="text-sm font-medium">
                  {profile?.is_verified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Badge */}
          {profile?.user_role === 'admin' && (
            <div className="pt-4 border-t">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm font-medium text-primary">Administrator</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Stats */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-sm text-muted-foreground">Notes Uploaded</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-sm text-muted-foreground">Downloads</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-sm text-muted-foreground">Contributions</div>
          </div>
        </div>
      </div>
    </div>
  );
};