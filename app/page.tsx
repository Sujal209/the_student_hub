import { Suspense } from 'react';
import { Metadata } from 'next';
import { Landing } from '@/components/landing/landing';
import { Dashboard } from '@/components/dashboard/dashboard';
import { AuthCheck } from '@/components/auth/auth-check';

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_COLLEGE_NAME} - Student Notes Hub`,
  description: `Access and share study notes at ${process.env.NEXT_PUBLIC_COLLEGE_NAME}. Upload, download, and collaborate on academic materials.`,
};

export default function HomePage() {
  return (
    <AuthCheck
      fallback={<Landing />}
      loading={
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading-spinner" />
        </div>
      }
    >
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading-spinner" />
        </div>
      }>
        <Dashboard />
      </Suspense>
    </AuthCheck>
  );
}