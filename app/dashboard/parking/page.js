'use client';
import { ParkingCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { COLORS } from '@/lib/constants/colors';
import { useParking } from '@/lib/api/queries';

export default function ParkingPage() {
  const { data: parkingSlots } = useParking();

  const stats = {
    total: parkingSlots?.length || 0,
    occupied: parkingSlots?.filter(p => p.status === 'occupied').length || 0,
    available: parkingSlots?.filter(p => p.status === 'available').length || 0,
    reserved: parkingSlots?.filter(p => p.status === 'reserved').length || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Parking Management</h1>
        <p className="text-muted-foreground mt-1">Manage parking slot allocation</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Occupied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.error }}>
              {stats.occupied}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.success }}>
              {stats.available}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Reserved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.warning }}>
              {stats.reserved}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parking Slots</CardTitle>
        </CardHeader>
        <CardContent>
          {parkingSlots?.length === 0 ? (
            <div className="text-center py-12">
              <ParkingCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No parking slots configured</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-6">
              {parkingSlots?.map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 border-2 rounded-lg text-center"
                  style={{
                    borderColor: slot.status === 'occupied' ? COLORS.error : slot.status === 'reserved' ? COLORS.warning : COLORS.success,
                    backgroundColor: slot.status === 'occupied' ? COLORS.error + '10' : slot.status === 'reserved' ? COLORS.warning + '10' : COLORS.success + '10',
                  }}
                >
                  <p className="font-bold text-lg">{slot.slotNumber}</p>
                  <p className="text-xs text-muted-foreground">{slot.type}</p>
                  <Badge className="mt-2" variant={slot.status === 'available' ? 'default' : 'secondary'}>
                    {slot.status}
                  </Badge>
                  {slot.vehicleNumber && (
                    <p className="text-xs font-mono mt-2">{slot.vehicleNumber}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
