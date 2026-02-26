'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Car, AlertCircle, Receipt, UserPlus, Siren, Building, TrendingUp, Clock, DollarSign, Truck, RefreshCw } from 'lucide-react';
import { COLORS } from '@/lib/constants/colors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useResidents, useComplaints, useVisitors } from '@/lib/api/queries';
import apiClient from '@/lib/api/client';
import Link from 'next/link';

const StatCard = ({ title, value, icon: Icon, color, description, href }) => {
  const content = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg" style={{ backgroundColor: color + '20' }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
};

export default function DashboardPage() {
  const { data: residents } = useResidents();
  const { data: complaints } = useComplaints();
  const { data: visitors } = useVisitors();
  const [dashStats, setDashStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await apiClient.get('/dashboard/stats');
      setDashStats(data);
    } catch (e) {
      console.error('Failed to fetch stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const ds = dashStats || {};

  const mainStats = [
    { title: 'Total Residents', value: ds.residents || residents?.length || 0, icon: Users, color: COLORS.primary, description: `${residents?.filter(r => r.status === 'active').length || 0} active`, href: '/dashboard/residents' },
    { title: 'Towers', value: ds.towers || 0, icon: Building2, color: COLORS.info, description: 'Total buildings', href: '/dashboard/flats' },
    { title: 'Total Flats', value: ds.flats || 0, icon: Building, color: COLORS.success, description: 'All units', href: '/dashboard/flats' },
    { title: 'Vehicles', value: ds.vehicles || 0, icon: Car, color: COLORS.warning, description: 'Registered vehicles', href: '/dashboard/vehicles' },
  ];

  const financeStats = [
    { title: 'Total Bills', value: ds.totalBills || 0, icon: Receipt, color: '#8b5cf6', description: `${ds.pendingBills || 0} pending`, href: '/dashboard/billing/maintenance' },
    { title: 'Bills Amount', value: `₹${(ds.totalBillsAmount || 0).toLocaleString()}`, icon: DollarSign, color: COLORS.success, description: `${ds.paidBills || 0} paid`, href: '/dashboard/billing/payments' },
    { title: 'Complaints This Month', value: ds.complaintsThisMonth || 0, icon: AlertCircle, color: COLORS.error, description: `${ds.openComplaints || 0} open / ${ds.totalComplaints || 0} total`, href: '/dashboard/complaints' },
    { title: "Today's Visitors", value: ds.visitorsToday || 0, icon: UserPlus, color: '#06b6d4', description: 'Checked in today', href: '/dashboard/visitors' },
  ];

  const recentComplaints = (complaints || []).slice(0, 5);
  const recentVisitors = (visitors || []).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome to MyTower Society Management System</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchStats}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Finance & Activity Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {financeStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Complaints */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Complaints</CardTitle>
            <Link href="/dashboard/complaints">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">View All</Badge>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentComplaints.length > 0 ? recentComplaints.map((complaint, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.error + '20' }}>
                      <AlertCircle className="h-4 w-4" style={{ color: COLORS.error }} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{complaint.title || complaint.description?.substring(0, 30) || 'Complaint'}</p>
                      <p className="text-xs text-muted-foreground">Flat {complaint.flatNumber || '-'}</p>
                    </div>
                  </div>
                  <Badge variant={complaint.status === 'resolved' ? 'default' : complaint.status === 'in_progress' ? 'secondary' : 'destructive'} className="text-xs">
                    {complaint.status || 'open'}
                  </Badge>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-4 text-sm">No complaints yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Visitors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Visitors</CardTitle>
            <Link href="/dashboard/visitors">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">View All</Badge>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentVisitors.length > 0 ? recentVisitors.map((visitor, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primary + '20' }}>
                      <UserPlus className="h-4 w-4" style={{ color: COLORS.primary }} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{visitor.visitorName || visitor.name || 'Visitor'}</p>
                      <p className="text-xs text-muted-foreground">Visiting {visitor.flatNumber || '-'} | {visitor.purpose || '-'}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {visitor.createdAt ? new Date(visitor.createdAt).toLocaleDateString() : '-'}
                  </Badge>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-4 text-sm">No visitors yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/emergency">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Siren className="h-5 w-5" style={{ color: COLORS.emergency }} />
                Emergency SOS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Trigger emergency alert for Security, Fire, or Medical assistance</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/move">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" style={{ color: COLORS.primary }} />
                Move Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{ds.pendingMoves || 0} pending move-in/move-out requests</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/billing/reports">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" style={{ color: COLORS.success }} />
                Financial Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View detailed financial reports and analytics</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
