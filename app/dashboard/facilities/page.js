'use client';
import { useState } from 'react';
import { Plus, Dumbbell, RefreshCw, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { useFacilities, useFacilityBookings, useCreateFacility, useCreateBooking } from '@/lib/api/queries';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function FacilitiesPage() {
  const queryClient = useQueryClient();
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities();
  const { data: bookings } = useFacilityBookings();
  const createFacility = useCreateFacility();
  const createBooking = useCreateBooking();

  const [facilityDialogOpen, setFacilityDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [facilityForm, setFacilityForm] = useState({ name: '', description: '', capacity: '', rate: '' });
  const [bookingForm, setBookingForm] = useState({ facilityName: '', flatNumber: '', bookingDate: '', timeSlot: '', purpose: '' });
  const [errors, setErrors] = useState({});

  const handleCreateFacility = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!facilityForm.name.trim()) newErrors.name = 'Name is required';
    if (!facilityForm.capacity || isNaN(facilityForm.capacity)) newErrors.capacity = 'Valid capacity is required';
    if (!facilityForm.rate || isNaN(facilityForm.rate)) newErrors.rate = 'Valid rate is required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    try {
      await createFacility.mutateAsync({ ...facilityForm, capacity: Number(facilityForm.capacity), rate: Number(facilityForm.rate) });
      toast.success('Facility added successfully!');
      setFacilityDialogOpen(false);
      setFacilityForm({ name: '', description: '', capacity: '', rate: '' });
      setErrors({});
    } catch (error) {
      toast.error('Failed to add facility');
    }
  };

  const handleBookNow = (facility) => {
    setSelectedFacility(facility);
    setBookingForm({ facilityName: facility.name, facilityId: facility.id, flatNumber: '', bookingDate: '', timeSlot: '10:00 AM - 12:00 PM', purpose: '' });
    setBookingDialogOpen(true);
  };

  const handleNewBooking = () => {
    setSelectedFacility(null);
    setBookingForm({ facilityName: '', facilityId: '', flatNumber: '', bookingDate: '', timeSlot: '10:00 AM - 12:00 PM', purpose: '' });
    setBookingDialogOpen(true);
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!bookingForm.facilityName) newErrors.facilityName = 'Select a facility';
    if (!bookingForm.flatNumber.trim()) newErrors.flatNumber = 'Flat number is required';
    if (!bookingForm.bookingDate) newErrors.bookingDate = 'Date is required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    try {
      await createBooking.mutateAsync(bookingForm);
      toast.success('Booking confirmed!');
      setBookingDialogOpen(false);
      setBookingForm({ facilityName: '', facilityId: '', flatNumber: '', bookingDate: '', timeSlot: '10:00 AM - 12:00 PM', purpose: '' });
      setErrors({});
    } catch (error) {
      toast.error('Failed to create booking');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Facility Booking</h1>
          <p className="text-muted-foreground mt-1">Book clubhouse, pool, hall</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => queryClient.invalidateQueries()}><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={facilityDialogOpen} onOpenChange={setFacilityDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Plus className="h-4 w-4 mr-2" />Add Facility</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Facility</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateFacility} className="space-y-4">
                <div className="space-y-2">
                  <Label>Facility Name *</Label>
                  <Input placeholder="e.g., Clubhouse, Pool" value={facilityForm.name} onChange={(e) => { setFacilityForm({...facilityForm, name: e.target.value}); setErrors({...errors, name: null}); }} className={errors.name ? 'border-red-500' : ''} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="Brief description" value={facilityForm.description} onChange={(e) => setFacilityForm({...facilityForm, description: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Capacity (people) *</Label>
                    <Input type="number" placeholder="50" value={facilityForm.capacity} onChange={(e) => { setFacilityForm({...facilityForm, capacity: e.target.value}); setErrors({...errors, capacity: null}); }} className={errors.capacity ? 'border-red-500' : ''} />
                    {errors.capacity && <p className="text-xs text-red-500">{errors.capacity}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Rate (₹/hour) *</Label>
                    <Input type="number" placeholder="2000" value={facilityForm.rate} onChange={(e) => { setFacilityForm({...facilityForm, rate: e.target.value}); setErrors({...errors, rate: null}); }} className={errors.rate ? 'border-red-500' : ''} />
                    {errors.rate && <p className="text-xs text-red-500">{errors.rate}</p>}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setFacilityDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createFacility.isPending} style={{ backgroundColor: COLORS.primary }} className="text-white">{createFacility.isPending ? 'Adding...' : 'Add Facility'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button style={{ backgroundColor: COLORS.primary }} className="text-white" onClick={handleNewBooking}>
            <Calendar className="h-4 w-4 mr-2" />New Booking
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {facilitiesLoading ? (
          <div className="col-span-3 text-center py-8">Loading facilities...</div>
        ) : (facilities?.length === 0 || !facilities) ? (
          <Card className="col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No facilities available</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Add Facility" to create your first facility</p>
            </CardContent>
          </Card>
        ) : (
          facilities.map((facility) => (
            <Card key={facility.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{facility.name}</CardTitle>
                  <Badge variant={facility.status === 'available' ? 'default' : 'secondary'}>{facility.status || 'available'}</Badge>
                </div>
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
                </div>
                <Button className="w-full mt-4 text-white" style={{ backgroundColor: COLORS.primary }} onClick={() => handleBookNow(facility)}>
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
          {bookings?.length === 0 || !bookings ? (
            <p className="text-center py-8 text-muted-foreground">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 10).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{booking.facilityName}</p>
                    <p className="text-sm text-muted-foreground">
                      Flat {booking.flatNumber} | {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : '-'} | {booking.timeSlot || ''}
                    </p>
                    {booking.purpose && <p className="text-xs text-muted-foreground">{booking.purpose}</p>}
                  </div>
                  <Badge>{booking.status || 'confirmed'}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Book Facility</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateBooking} className="space-y-4">
            <div className="space-y-2">
              <Label>Facility *</Label>
              {selectedFacility ? (
                <Input value={selectedFacility.name} readOnly className="bg-muted" />
              ) : (
                <select className="w-full p-2 border rounded-md" value={bookingForm.facilityName} onChange={(e) => { const f = facilities?.find(f => f.name === e.target.value); setBookingForm({...bookingForm, facilityName: e.target.value, facilityId: f?.id || ''}); setErrors({...errors, facilityName: null}); }}>
                  <option value="">Select facility</option>
                  {facilities?.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                </select>
              )}
              {errors.facilityName && <p className="text-xs text-red-500">{errors.facilityName}</p>}
            </div>
            <div className="space-y-2">
              <Label>Flat Number *</Label>
              <Input placeholder="e.g., A-101" value={bookingForm.flatNumber} onChange={(e) => { setBookingForm({...bookingForm, flatNumber: e.target.value}); setErrors({...errors, flatNumber: null}); }} className={errors.flatNumber ? 'border-red-500' : ''} />
              {errors.flatNumber && <p className="text-xs text-red-500">{errors.flatNumber}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" value={bookingForm.bookingDate} onChange={(e) => { setBookingForm({...bookingForm, bookingDate: e.target.value}); setErrors({...errors, bookingDate: null}); }} className={errors.bookingDate ? 'border-red-500' : ''} />
                {errors.bookingDate && <p className="text-xs text-red-500">{errors.bookingDate}</p>}
              </div>
              <div className="space-y-2">
                <Label>Time Slot</Label>
                <select className="w-full p-2 border rounded-md" value={bookingForm.timeSlot} onChange={(e) => setBookingForm({...bookingForm, timeSlot: e.target.value})}>
                  <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                  <option value="12:00 PM - 2:00 PM">12:00 PM - 2:00 PM</option>
                  <option value="2:00 PM - 4:00 PM">2:00 PM - 4:00 PM</option>
                  <option value="4:00 PM - 6:00 PM">4:00 PM - 6:00 PM</option>
                  <option value="6:00 PM - 8:00 PM">6:00 PM - 8:00 PM</option>
                  <option value="8:00 PM - 10:00 PM">8:00 PM - 10:00 PM</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Purpose</Label>
              <Input placeholder="e.g., Birthday party, Meeting" value={bookingForm.purpose} onChange={(e) => setBookingForm({...bookingForm, purpose: e.target.value})} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setBookingDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createBooking.isPending} style={{ backgroundColor: COLORS.primary }} className="text-white">{createBooking.isPending ? 'Booking...' : 'Confirm Booking'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
