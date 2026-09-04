import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { profile } from '@/data/personal';

const siteUrl = 'https://alexmecklin.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: profile.name,
  description: profile.bio,
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: '/favicon.png',
  },
  openGraph: {
    title: profile.name,
    description: profile.bio,
    url: siteUrl,
    siteName: profile.name,
    type: 'website',
    // No `images` here: app/opengraph-image.tsx generates the card and
    // Next.js wires up the og:image/twitter:image tags for it automatically.
  },
  twitter: {
    card: 'summary_large_image',
    title: profile.name,
    description: profile.bio,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a1929',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
        <Analytics />
      </body>
    </html>
  );
}
