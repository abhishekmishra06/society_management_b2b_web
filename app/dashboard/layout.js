'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import EmergencyAlert from '@/components/emergency/EmergencyAlert';
import { Toaster } from 'sonner';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="lg:pl-64">
        <Header onMenuClick={() => setMobileOpen(true)} />
        
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
      
      <EmergencyAlert />
      <Toaster position="top-right" richColors />
    </div>
  );
}
