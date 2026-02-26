'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, ChevronDown, ChevronRight, Menu, X,
  LayoutDashboard, Users, UserCheck, UserCog, UsersRound,
  Building, Car, FileCheck, Receipt, CreditCard, FileText,
  Wallet, TrendingUp, UserPlus, Shield, KeyRound, AlertOctagon,
  Briefcase, Clock, DollarSign, Store, FileSignature,
  MessageSquare, Mail, Bell, AlertCircle,
  Home as HomeIcon, Dumbbell, Package,
  ParkingCircle, Truck, FileStack, Siren, LogOut, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { COLORS } from '@/lib/constants/colors';
import { cn } from '@/lib/utils';
import { SIDEBAR_PERMISSION_MAP, hasPermission } from '@/lib/permissions';
import UserProfileDialog from '@/components/UserProfileDialog';

const MENU_ITEMS = [
  {
    group: 'Dashboard',
    icon: LayoutDashboard,
    items: [
      { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Resident & Society',
    icon: Users,
    items: [
      { name: 'Residents', path: '/dashboard/residents', icon: Users },
      { name: 'Owners', path: '/dashboard/owners', icon: UserCheck },
      { name: 'Tenants', path: '/dashboard/tenants', icon: UserCog },
      { name: 'Family Members', path: '/dashboard/family', icon: UsersRound },
      { name: 'Flats & Towers', path: '/dashboard/flats', icon: Building },
      { name: 'Vehicles', path: '/dashboard/vehicles', icon: Car },
      { name: 'KYC Verification', path: '/dashboard/kyc', icon: FileCheck },
    ],
  },
  {
    group: 'Billing & Finance',
    icon: Receipt,
    items: [
      { name: 'Maintenance Billing', path: '/dashboard/billing/maintenance', icon: Receipt },
      { name: 'Utility Billing', path: '/dashboard/billing/utility', icon: CreditCard },
      { name: 'Payment Collection', path: '/dashboard/billing/payments', icon: Wallet },
      { name: 'Receipts', path: '/dashboard/billing/receipts', icon: FileText },
      { name: 'Due & Penalty', path: '/dashboard/billing/dues', icon: AlertOctagon },
      { name: 'Expense Tracking', path: '/dashboard/billing/expenses', icon: TrendingUp },
      { name: 'Accounting Ledger', path: '/dashboard/billing/ledger', icon: FileStack },
      { name: 'Financial Reports', path: '/dashboard/billing/reports', icon: TrendingUp },
    ],
  },
  {
    group: 'Security & Visitor',
    icon: Shield,
    items: [
      { name: 'Visitor Management', path: '/dashboard/visitors', icon: UserPlus },
      { name: 'Guest Pre-Approval', path: '/dashboard/visitors/pre-approval', icon: UserCheck },
      { name: 'Gate Pass', path: '/dashboard/visitors/gate-pass', icon: KeyRound },
      { name: 'Material Exit Pass', path: '/dashboard/visitors/material-pass', icon: Package },
      { name: 'Visitor History', path: '/dashboard/visitors/history', icon: Clock },
      { name: 'Blacklist', path: '/dashboard/visitors/blacklist', icon: AlertOctagon },
      { name: 'Security Dashboard', path: '/dashboard/security', icon: Shield },
      { name: 'Emergency SOS', path: '/dashboard/emergency', icon: Siren },
    ],
  },
  {
    group: 'Staff & Vendor',
    icon: Briefcase,
    items: [
      { name: 'Staff Management', path: '/dashboard/staff', icon: Briefcase },
      { name: 'Staff Attendance', path: '/dashboard/staff/attendance', icon: Clock },
      { name: 'Staff Salary', path: '/dashboard/staff/salary', icon: DollarSign },
      { name: 'Vendor Management', path: '/dashboard/vendors', icon: Store },
      { name: 'Vendor Contracts', path: '/dashboard/vendors/contracts', icon: FileSignature },
      { name: 'Vendor Payments', path: '/dashboard/vendors/payments', icon: DollarSign },
    ],
  },
  {
    group: 'Communication',
    icon: MessageSquare,
    items: [
      { name: 'Notification Center', path: '/dashboard/notification-center', icon: Bell },
      { name: 'Notice Board', path: '/dashboard/notices', icon: Bell },
      { name: 'Send Notifications', path: '/dashboard/notifications', icon: Mail },
      { name: 'Announcements', path: '/dashboard/announcements', icon: MessageSquare },
    ],
  },
  {
    group: 'Complaints',
    icon: AlertCircle,
    items: [
      { name: 'Complaint Management', path: '/dashboard/complaints', icon: AlertCircle },
    ],
  },
  {
    group: 'Facility & Asset',
    icon: HomeIcon,
    items: [
      { name: 'Facility Booking', path: '/dashboard/facilities', icon: Dumbbell },
      { name: 'Asset Management', path: '/dashboard/assets', icon: Package },
      { name: 'AMC Management', path: '/dashboard/amc', icon: FileSignature },
    ],
  },
  {
    group: 'Parking & Move',
    icon: ParkingCircle,
    items: [
      { name: 'Parking Management', path: '/dashboard/parking', icon: ParkingCircle },
      { name: 'Move-In/Move-Out', path: '/dashboard/move', icon: Truck },
      { name: 'Documents', path: '/dashboard/documents', icon: FileStack },
    ],
  },
];

// Find which group contains the active path
function findActiveGroup(pathname) {
  for (const section of MENU_ITEMS) {
    if (section.items.some(item => pathname === item.path || pathname.startsWith(item.path + '/'))) {
      return section.group;
    }
  }
  return 'Dashboard';
}

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const scrollRef = useRef(null);
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const activeGroup = findActiveGroup('/dashboard');
    return ['Dashboard', activeGroup];
  });
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.name || user.userId);
    }
  }, []);

  // Auto-expand the group containing the active page
  useEffect(() => {
    const activeGroup = findActiveGroup(pathname);
    if (activeGroup && !expandedGroups.includes(activeGroup)) {
      setExpandedGroups(prev => [...prev, activeGroup]);
    }
  }, [pathname]);

  const toggleGroup = useCallback((groupName) => {
    setExpandedGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-background border-r z-30" style={{ borderColor: COLORS.border }}>
        <div className="h-full flex flex-col">
          {/* Logo Header */}
          <div className="p-4 border-b shrink-0" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.primary }}>
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg" style={{ color: COLORS.primary }}>MyTower</h1>
                <p className="text-xs text-muted-foreground">Society Management</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b shrink-0" style={{ borderColor: COLORS.border }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primaryLight }}>
                <span className="text-white font-semibold">{userName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation - using native div with overflow instead of ScrollArea */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-2">
              {MENU_ITEMS.map((section) => {
                const isExpanded = expandedGroups.includes(section.group);
                const GroupIcon = section.icon;
                const hasActiveItem = section.items.some(item => pathname === item.path);
                
                return (
                  <div key={section.group}>
                    <button
                      onClick={() => toggleGroup(section.group)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent transition-colors",
                        hasActiveItem && !isExpanded && "bg-accent"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <GroupIcon className="h-4 w-4" style={{ color: COLORS.primary }} />
                        <span className="font-medium text-sm">{section.group}</span>
                      </div>
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    
                    {isExpanded && (
                      <div className="mt-1 ml-4 space-y-1">
                        {section.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isActive = pathname === item.path;
                          
                          return (
                            <Link key={item.path} href={item.path} scroll={false}>
                              <div
                                className={cn(
                                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                                  isActive 
                                    ? 'font-medium text-white' 
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                )}
                                style={isActive ? { backgroundColor: COLORS.primary } : {}}
                                onClick={() => mobileOpen && setMobileOpen(false)}
                              >
                                <ItemIcon className="h-4 w-4" />
                                <span>{item.name}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logout */}
          <div className="p-4 border-t shrink-0" style={{ borderColor: COLORS.border }}>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 h-screen w-64 bg-background border-r z-50 lg:hidden" style={{ borderColor: COLORS.border }}>
            <div className="h-full flex flex-col">
              {/* Logo Header with close */}
              <div className="p-4 border-b shrink-0" style={{ borderColor: COLORS.border }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.primary }}>
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="font-bold text-lg" style={{ color: COLORS.primary }}>MyTower</h1>
                      <p className="text-xs text-muted-foreground">Society Management</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* User Info */}
              <div className="p-4 border-b shrink-0" style={{ borderColor: COLORS.border }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primaryLight }}>
                    <span className="text-white font-semibold">{userName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="flex-1 overflow-y-auto px-3 py-4">
                <div className="space-y-2">
                  {MENU_ITEMS.map((section) => {
                    const isExpanded = expandedGroups.includes(section.group);
                    const GroupIcon = section.icon;
                    
                    return (
                      <div key={section.group}>
                        <button
                          onClick={() => toggleGroup(section.group)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <GroupIcon className="h-4 w-4" style={{ color: COLORS.primary }} />
                            <span className="font-medium text-sm">{section.group}</span>
                          </div>
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                        
                        {isExpanded && (
                          <div className="mt-1 ml-4 space-y-1">
                            {section.items.map((item) => {
                              const ItemIcon = item.icon;
                              const isActive = pathname === item.path;
                              
                              return (
                                <Link key={item.path} href={item.path} scroll={false}>
                                  <div
                                    className={cn(
                                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                                      isActive 
                                        ? 'font-medium text-white' 
                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                    )}
                                    style={isActive ? { backgroundColor: COLORS.primary } : {}}
                                    onClick={() => setMobileOpen(false)}
                                  >
                                    <ItemIcon className="h-4 w-4" />
                                    <span>{item.name}</span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Logout */}
              <div className="p-4 border-t shrink-0" style={{ borderColor: COLORS.border }}>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
