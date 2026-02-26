'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import EmergencyAlert from '@/components/emergency/EmergencyAlert';
import WelcomeGuide from '@/components/WelcomeGuide';
import { Toaster } from 'sonner';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const mainContentRef = useRef(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    // Check if welcome guide should be shown
    const guideSeen = localStorage.getItem('welcomeGuideSeen');
    const isFirstLogin = localStorage.getItem('isFirstLogin');
    if (!guideSeen || isFirstLogin === 'true') {
      setShowGuide(true);
      localStorage.removeItem('isFirstLogin');
    }
  }, [router]);

  // Scroll main content to top on route change, sidebar stays untouched
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname]);

  return (
    <div className="h-screen overflow-hidden bg-background">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="lg:pl-64 h-screen flex flex-col overflow-hidden">
        <Header onMenuClick={() => setMobileOpen(true)} />
        
        <main ref={mainContentRef} className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
      
      <EmergencyAlert />
      <Toaster position="top-right" richColors />

      {showGuide && <WelcomeGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
}
