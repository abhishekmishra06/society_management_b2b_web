'use client';
import { useState, useEffect } from 'react';
import { Building2, Users, UsersRound, TrendingUp, Activity, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

const BRAND = '#694cd0';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await apiClient.get('/admin/stats');
        setStats(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const s = stats || {};

  const cards = [
    { title: 'Total Societies', value: s.totalSocieties || 0, icon: Building2, color: BRAND, desc: `${s.activeSocieties || 0} active`, href: '/admin/societies' },
    { title: 'Total Users', value: s.totalUsers || 0, icon: Users, color: '#3b82f6', desc: `${s.adminUsers || 0} admins, ${s.staffUsers || 0} staff`, href: '/admin/users' },
    { title: 'Total Teams', value: s.totalTeams || 0, icon: UsersRound, color: '#10b981', desc: 'Across all societies', href: '/admin/teams' },
    { title: 'Super Admins', value: s.superAdmins || 0, icon: TrendingUp, color: '#f59e0b', desc: 'System administrators' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-gray-300 rounded-full" style={{ borderTopColor: BRAND }} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage all societies, users, and teams from one place</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map(card => {
          const Icon = card.icon;
          const inner = (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{card.title}</CardTitle>
                <div className="p-2 rounded-lg" style={{ backgroundColor: card.color + '15' }}>
                  <Icon className="h-5 w-5" style={{ color: card.color }} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.desc}</p>
              </CardContent>
            </Card>
          );
          return card.href ? <Link key={card.title} href={card.href}>{inner}</Link> : <div key={card.title}>{inner}</div>;
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Societies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Societies</CardTitle>
            <Link href="/admin/societies"><Badge variant="outline" className="cursor-pointer">View All <ArrowRight className="h-3 w-3 ml-1" /></Badge></Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(s.recentSocieties || []).length > 0 ? (s.recentSocieties || []).map((soc, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: BRAND + '15' }}>
                      <Building2 className="h-4 w-4" style={{ color: BRAND }} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{soc.name}</p>
                      <p className="text-xs text-gray-400">{soc.city || soc.address || '-'}</p>
                    </div>
                  </div>
                  <Badge variant={soc.status === 'active' ? 'default' : 'secondary'}>{soc.status}</Badge>
                </div>
              )) : <p className="text-center text-gray-400 py-4 text-sm">No societies yet</p>}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Users</CardTitle>
            <Link href="/admin/users"><Badge variant="outline" className="cursor-pointer">View All <ArrowRight className="h-3 w-3 ml-1" /></Badge></Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(s.recentUsers || []).length > 0 ? (s.recentUsers || []).map((u, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: BRAND }}>
                      {(u.name || u.userId || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{u.name || u.userId}</p>
                      <p className="text-xs text-gray-400">{u.role}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">{u.role}</Badge>
                </div>
              )) : <p className="text-center text-gray-400 py-4 text-sm">No users yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/societies">
          <Card className="hover:shadow-md transition cursor-pointer border-l-4" style={{ borderLeftColor: BRAND }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8" style={{ color: BRAND }} />
                <div>
                  <p className="font-semibold">Onboard Society</p>
                  <p className="text-sm text-gray-500">Add a new society to the platform</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/users">
          <Card className="hover:shadow-md transition cursor-pointer border-l-4" style={{ borderLeftColor: '#3b82f6' }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-semibold">Add User</p>
                  <p className="text-sm text-gray-500">Create admin or staff accounts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/teams">
          <Card className="hover:shadow-md transition cursor-pointer border-l-4" style={{ borderLeftColor: '#10b981' }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <UsersRound className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-semibold">Create Team</p>
                  <p className="text-sm text-gray-500">Organize users with team permissions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
