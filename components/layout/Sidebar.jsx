'use client';
import { useState, useEffect } from 'react';
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
  ParkingCircle, Truck, FileStack, Siren, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { COLORS } from '@/lib/constants/colors';
import { cn } from '@/lib/utils';

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

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedGroups, setExpandedGroups] = useState(['Dashboard']);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.name || user.userId);
    }
  }, []);

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Logo Header */}
      <div className="p-4 border-b" style={{ borderColor: COLORS.border }}>
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
          {mobileOpen && (
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="lg:hidden">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b" style={{ borderColor: COLORS.border }}>
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

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
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
                        <Link key={item.path} href={item.path}>
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
      </ScrollArea>

      {/* Logout */}
      <div className="p-4 border-t" style={{ borderColor: COLORS.border }}>
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
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-background border-r" style={{ borderColor: COLORS.border }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 h-screen w-64 bg-background border-r z-50 lg:hidden" style={{ borderColor: COLORS.border }}>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
