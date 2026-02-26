'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, LayoutDashboard, Building2, Users, UsersRound,
  Settings, LogOut, ChevronDown, ChevronRight, Menu, X, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';

const ADMIN_MENU = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Societies', path: '/admin/societies', icon: Building2 },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Teams', path: '/admin/teams', icon: UsersRound },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const BRAND = '#694cd0';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mainRef = useRef(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    if (!token) { router.push('/login'); return; }
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role !== 'SUPER_ADMIN') { router.push('/dashboard'); return; }
      setUserName(user.name || user.userId);
    }
  }, [router]);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  const handleLogout = () => { localStorage.clear(); router.push('/login'); };

  const Sidebar = ({ mobile }) => (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: BRAND }}>
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">MyTower</h1>
              <p className="text-xs text-gray-400">Super Admin</p>
            </div>
          </div>
          {mobile && (
            <Button variant="ghost" size="icon" className="text-white" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* User */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: BRAND }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate text-sm">{userName}</p>
            <p className="text-xs text-gray-400">Super Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {ADMIN_MENU.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} scroll={false}>
              <div
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all',
                  isActive ? 'text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                )}
                style={isActive ? { backgroundColor: BRAND } : {}}
                onClick={() => mobile && setMobileOpen(false)}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Society Panel Link */}
      <div className="p-3 border-t border-gray-700">
        <Link href="/dashboard">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition">
            <Building2 className="h-5 w-5" />
            <span>Go to Society Panel</span>
          </div>
        </Link>
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-gray-700">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 transition w-full">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 z-30">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 h-screen w-64 z-50 lg:hidden">
            <Sidebar mobile />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="lg:pl-64 h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b px-4 lg:px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="font-semibold text-gray-700">
              {ADMIN_MENU.find(m => m.path === pathname)?.name || 'Super Admin'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Bell className="h-5 w-5 text-gray-500" /></Button>
          </div>
        </header>

        {/* Page Content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
