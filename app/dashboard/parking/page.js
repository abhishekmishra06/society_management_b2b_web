'use client';
import { useState } from 'react';
import { ParkingCircle, Plus, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { useParking, useCreateParkingSlot } from '@/lib/api/queries';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function ParkingPage() {
  const queryClient = useQueryClient();
  const { data: parkingSlots, isLoading } = useParking();
  const createSlot = useCreateParkingSlot();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    slotNumber: '', type: 'car', status: 'available', vehicleNumber: '', flatNumber: '', ownerName: ''
  });
  const [errors, setErrors] = useState({});

  const stats = {
    total: (parkingSlots || []).length,
    occupied: (parkingSlots || []).filter(p => p.status === 'occupied').length,
    available: (parkingSlots || []).filter(p => p.status === 'available').length,
    reserved: (parkingSlots || []).filter(p => p.status === 'reserved').length,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.slotNumber.trim()) newErrors.slotNumber = 'Slot number is required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    try {
      await createSlot.mutateAsync(formData);
      toast.success('Parking slot added successfully!');
      setDialogOpen(false);
      setFormData({ slotNumber: '', type: 'car', status: 'available', vehicleNumber: '', flatNumber: '', ownerName: '' });
      setErrors({});
    } catch (error) {
      toast.error('Failed to add parking slot');
    }
  };

  const filtered = (parkingSlots || []).filter(s => {
    const q = searchQuery.toLowerCase();
    return (s.slotNumber || '').toLowerCase().includes(q) || (s.vehicleNumber || '').toLowerCase().includes(q) || (s.flatNumber || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Parking Management</h1>
          <p className="text-muted-foreground mt-1">Manage parking slot allocation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => queryClient.invalidateQueries()}><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: COLORS.primary }} className="text-white"><Plus className="h-4 w-4 mr-2" />Add Slot</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Parking Slot</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Slot Number *</Label>
                  <Input placeholder="e.g., P-001, B1-01" value={formData.slotNumber} onChange={(e) => { setFormData({...formData, slotNumber: e.target.value}); setErrors({...errors, slotNumber: null}); }} className={errors.slotNumber ? 'border-red-500' : ''} />
                  {errors.slotNumber && <p className="text-xs text-red-500">{errors.slotNumber}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select className="w-full p-2 border rounded-md" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                      <option value="car">Car</option>
                      <option value="bike">Bike</option>
                      <option value="ev">EV Charging</option>
                      <option value="visitor">Visitor</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select className="w-full p-2 border rounded-md" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="reserved">Reserved</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vehicle Number</Label>
                    <Input placeholder="e.g., MH-01-AB-1234" value={formData.vehicleNumber} onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Flat Number</Label>
                    <Input placeholder="e.g., A-101" value={formData.flatNumber} onChange={(e) => setFormData({...formData, flatNumber: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Owner Name</Label>
                  <Input placeholder="Resident name" value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createSlot.isPending} style={{ backgroundColor: COLORS.primary }} className="text-white">{createSlot.isPending ? 'Adding...' : 'Add Slot'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm">Total Slots</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Occupied</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.error }}>{stats.occupied}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Available</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.success }}>{stats.available}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Reserved</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.warning }}>{stats.reserved}</p></CardContent></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by slot, vehicle or flat..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parking Slots</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <ParkingCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No parking slots configured</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Add Slot" to create your first parking slot</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-6">
              {filtered.map((slot) => (
                <div key={slot.id} className="p-4 border-2 rounded-lg text-center" style={{ borderColor: slot.status === 'occupied' ? COLORS.error : slot.status === 'reserved' ? COLORS.warning : COLORS.success, backgroundColor: (slot.status === 'occupied' ? COLORS.error : slot.status === 'reserved' ? COLORS.warning : COLORS.success) + '10' }}>
                  <p className="font-bold text-lg">{slot.slotNumber}</p>
                  <p className="text-xs text-muted-foreground capitalize">{slot.type}</p>
                  <Badge className="mt-2" variant={slot.status === 'available' ? 'default' : 'secondary'}>{slot.status}</Badge>
                  {slot.vehicleNumber && <p className="text-xs font-mono mt-2">{slot.vehicleNumber}</p>}
                  {slot.flatNumber && <p className="text-xs text-muted-foreground mt-1">Flat: {slot.flatNumber}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
