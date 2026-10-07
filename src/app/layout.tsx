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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#FAF7F2] text-[#18181B] font-sans antialiased selection:bg-red-700 selection:text-white">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
