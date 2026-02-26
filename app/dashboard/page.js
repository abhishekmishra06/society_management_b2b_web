'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Car, AlertCircle, Receipt, UserPlus, Siren, Building } from 'lucide-react';
import { COLORS } from '@/lib/constants/colors';
import { useResidents, useTowers, useFlats, useVehicles } from '@/lib/api/queries';
import { Badge } from '@/components/ui/badge';

const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <Card>
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

export default function DashboardPage() {
  const { data: residents } = useResidents();
  const { data: towers } = useTowers();
  const { data: flats } = useFlats();
  const { data: vehicles } = useVehicles();

  const stats = [
    {
      title: 'Total Residents',
      value: residents?.length || 0,
      icon: Users,
      color: COLORS.primary,
      description: `${residents?.filter(r => r.status === 'active').length || 0} active`,
    },
    {
      title: 'Towers',
      value: towers?.length || 0,
      icon: Building2,
      color: COLORS.info,
      description: 'Total buildings',
    },
    {
      title: 'Total Flats',
      value: flats?.length || 0,
      icon: Building,
      color: COLORS.success,
      description: `${flats?.filter(f => f.occupancyStatus === 'occupied').length || 0} occupied`,
    },
    {
      title: 'Vehicles',
      value: vehicles?.length || 0,
      icon: Car,
      color: COLORS.warning,
      description: 'Registered vehicles',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to MyTower Society Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Siren className="h-5 w-5" style={{ color: COLORS.emergency }} />
              Emergency SOS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Trigger emergency alert for Security, Fire, or Medical assistance
            </p>
            <Badge variant="destructive">Real-time with Socket.io</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" style={{ color: COLORS.primary }} />
              Visitor Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Pre-approve guests, generate QR codes, and track visitor history
            </p>
            <Badge>Coming Soon</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" style={{ color: COLORS.success }} />
              Billing & Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Manage maintenance bills, utility payments, and financial reports
            </p>
            <Badge>Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {residents?.slice(0, 5).map((resident, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primaryLight }}>
                    <span className="text-white font-semibold">{resident.name?.charAt(0) || 'R'}</span>
                  </div>
                  <div>
                    <p className="font-medium">{resident.name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">Flat {resident.flatNumber} • Tower {resident.tower}</p>
                  </div>
                </div>
                <Badge variant={resident.status === 'active' ? 'default' : 'secondary'}>
                  {resident.status || 'active'}
                </Badge>
              </div>
            ))}
            {(!residents || residents.length === 0) && (
              <p className="text-center text-muted-foreground py-8">No residents yet. Add your first resident!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
