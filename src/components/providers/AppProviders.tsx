'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/shopkeeper');

  if (isDashboard) {
    return <main className="flex-1 min-h-screen">{children}</main>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <LayoutShell>{children}</LayoutShell>
      </CartProvider>
    </AuthProvider>
  );
}
