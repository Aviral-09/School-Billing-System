import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AntigravityAnalytics } from '@/components/AntigravityAnalytics';
import { SCHOOL_CONFIG } from '@/lib/schoolConfig';

import Script from 'next/script';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: `${SCHOOL_CONFIG.name} | Fee & Billing Portal`,
  description: `Official fee management and billing system for ${SCHOOL_CONFIG.name}.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://cdn.amplitude.com/libs/analytics-browser-2.11.1-min.js.gz"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.amplitude.com/libs/plugin-session-replay-browser-1.25.0-min.js.gz"
          strategy="beforeInteractive"
        />
        <Script id="amplitude-init" strategy="afterInteractive">
          {`
            window.amplitude.add(window.sessionReplay.plugin({sampleRate: 1}));
            window.amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY || '', {"autocapture":{"elementInteractions":true}});
          `}
        </Script>
      </head>
      <body>
        <Suspense fallback={null}>
          <AntigravityAnalytics />
        </Suspense>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
