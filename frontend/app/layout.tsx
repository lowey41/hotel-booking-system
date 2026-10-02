import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ChatBot } from '@/components/shared/chatbot';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'StayWise - Find Your Perfect Stay', template: '%s | StayWise' },
  description: 'Discover and book amazing hotels worldwide with AI-powered recommendations.',
  keywords: ['hotel booking', 'travel', 'accommodation', 'vacation'],
  authors: [{ name: 'StayWise Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://staywise.com',
    siteName: 'StayWise',
    title: 'StayWise - Find Your Perfect Stay',
    description: 'Discover and book amazing hotels worldwide.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#ffffff' }, { media: '(prefers-color-scheme: dark)', color: '#0f172a' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <AuthProvider>
              {children}
              <ChatBot />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--card-foreground))',
                    border: '1px solid hsl(var(--border))',
                  },
                }}
              />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
