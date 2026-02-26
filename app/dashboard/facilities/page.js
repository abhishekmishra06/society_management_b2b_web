'use client';
import { Plus, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { COLORS } from '@/lib/constants/colors';
import { useFacilities, useFacilityBookings } from '@/lib/api/queries';

export default function FacilitiesPage() {
  const { data: facilities } = useFacilities();
  const { data: bookings } = useFacilityBookings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Facility Booking</h1>
          <p className="text-muted-foreground mt-1">Book clubhouse, pool, hall</p>
        </div>
        <Button style={{ backgroundColor: COLORS.primary }}>
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {facilities?.length === 0 ? (
          <Card className="col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No facilities available</p>
            </CardContent>
          </Card>
        ) : (
          facilities?.map((facility) => (
            <Card key={facility.id}>
              <CardHeader>
                <CardTitle>{facility.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{facility.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capacity:</span>
                    <span className="font-medium">{facility.capacity} people</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rate:</span>
                    <span className="font-medium">₹{facility.rate}/hour</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium capitalize" style={{ color: facility.status === 'available' ? COLORS.success : COLORS.error }}>
                      {facility.status}
                    </span>
                  </div>
                </div>
                <Button className="w-full mt-4" style={{ backgroundColor: COLORS.primary }}>
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings ({bookings?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings?.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {bookings?.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{booking.facilityName}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.flatNumber} • {new Date(booking.bookingDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge>{booking.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
