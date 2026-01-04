import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import OfflineIndicator from '@/components/OfflineIndicator';
import InstallPrompt from '@/components/InstallPrompt';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import ErrorBoundary from '@/components/ErrorBoundary';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sellx.prox.uz';

export const metadata: Metadata = {
  title: {
    default: 'SellX - Sales Automation',
    template: '%s | SellX',
  },
  description: 'Mijozlarni boshqarish va follow-up eslatmalar tizimi',
  manifest: '/manifest.json',
  metadataBase: new URL(siteUrl),
  applicationName: 'SellX',
  keywords: ['sales', 'crm', 'automation', 'clients', 'follow-up', 'pwa'],
  authors: [{ name: 'SellX Team' }],
  creator: 'SellX',
  publisher: 'SellX',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SellX',
  },
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    url: siteUrl,
    siteName: 'SellX',
    title: 'SellX - Sales Automation',
    description: 'Mijozlarni boshqarish va follow-up eslatmalar tizimi',
  },
  twitter: {
    card: 'summary',
    title: 'SellX - Sales Automation',
    description: 'Mijozlarni boshqarish va follow-up eslatmalar tizimi',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <link rel="icon" type="image/svg+xml" href="/icon-192.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="safe-top safe-bottom">
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              <NotificationProvider>
                <ServiceWorkerRegistration />
                <OfflineIndicator />
                {children}
                <InstallPrompt />
              </NotificationProvider>
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
