import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import AppProviders from '../components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Scan-Pay-Eat | Multi-Shop QR Food Ordering',
  description: 'Seamless QR food ordering and real-time kitchen tracking platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
