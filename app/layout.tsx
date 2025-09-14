import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Student Notes Hub',
  description: 'A college-specific notes sharing platform',
  keywords: ['notes', 'student', 'college', 'education', 'study', 'sharing'],
  authors: [{ name: 'Student Notes Hub Team' }],
  creator: 'Student Notes Hub',
  publisher: 'Student Notes Hub',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    title: process.env.NEXT_PUBLIC_APP_NAME || 'Student Notes Hub',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'A college-specific notes sharing platform',
    siteName: process.env.NEXT_PUBLIC_APP_NAME || 'Student Notes Hub',
  },
  twitter: {
    card: 'summary_large_image',
    title: process.env.NEXT_PUBLIC_APP_NAME || 'Student Notes Hub',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'A college-specific notes sharing platform',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            {children}
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}