'use client';
import { useState } from 'react';
import { ParkingCircle, Plus, RefreshCw, Search, Edit, Trash2, Car, Bike, Zap, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { useParking, useCreateParkingSlot, useUpdateParkingSlot, useDeleteParkingSlot } from '@/lib/api/queries';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const SLOT_TYPES = ['car', 'bike', 'ev', 'visitor'];
const SLOT_STATUSES = ['available', 'occupied', 'reserved'];

export default function ParkingPage() {
  const queryClient = useQueryClient();
  const { data: parkingSlots, isLoading } = useParking();
  const createSlot = useCreateParkingSlot();
  const updateSlot = useUpdateParkingSlot();
  const deleteSlot = useDeleteParkingSlot();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const [formData, setFormData] = useState({
    slotNumber: '', type: 'car', status: 'available', vehicleNumber: '', flatNumber: '', ownerName: '', zone: ''
  });
  const [errors, setErrors] = useState({});

  const slots = parkingSlots || [];

  const stats = {
    total: slots.length,
    occupied: slots.filter(p => p.status === 'occupied').length,
    available: slots.filter(p => p.status === 'available').length,
    reserved: slots.filter(p => p.status === 'reserved').length,
    cars: slots.filter(p => p.type === 'car').length,
    bikes: slots.filter(p => p.type === 'bike').length,
    ev: slots.filter(p => p.type === 'ev').length,
  };

  const filtered = slots.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (s.slotNumber || '').toLowerCase().includes(q) || (s.vehicleNumber || '').toLowerCase().includes(q) || (s.flatNumber || '').toLowerCase().includes(q) || (s.ownerName || '').toLowerCase().includes(q);
    const matchesType = filterType === 'all' || s.type === filterType;
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const resetForm = () => {
    setFormData({ slotNumber: '', type: 'car', status: 'available', vehicleNumber: '', flatNumber: '', ownerName: '', zone: '' });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.slotNumber.trim()) newErrors.slotNumber = 'Slot number is required';
    return newErrors;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    try {
      await createSlot.mutateAsync(formData);
      toast.success(`Parking slot ${formData.slotNumber} created!`);
      setAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create parking slot');
    }
  };

  const handleEdit = (slot) => {
    setSelectedSlot(slot);
    setFormData({ slotNumber: slot.slotNumber || '', type: slot.type || 'car', status: slot.status || 'available', vehicleNumber: slot.vehicleNumber || '', flatNumber: slot.flatNumber || '', ownerName: slot.ownerName || '', zone: slot.zone || '' });
    setErrors({});
    setEditDialogOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    try {
      await updateSlot.mutateAsync({ id: selectedSlot.id, ...formData });
      toast.success(`Slot ${formData.slotNumber} updated!`);
      setEditDialogOpen(false);
      setSelectedSlot(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to update slot');
    }
  };

  const handleAssign = (slot) => {
    setSelectedSlot(slot);
    setFormData({ ...formData, vehicleNumber: slot.vehicleNumber || '', flatNumber: slot.flatNumber || '', ownerName: slot.ownerName || '' });
    setAssignDialogOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSlot.mutateAsync({
        id: selectedSlot.id,
        vehicleNumber: formData.vehicleNumber,
        flatNumber: formData.flatNumber,
        ownerName: formData.ownerName,
        status: formData.vehicleNumber ? 'occupied' : 'available',
      });
      toast.success(formData.vehicleNumber ? `Vehicle assigned to slot ${selectedSlot.slotNumber}` : `Slot ${selectedSlot.slotNumber} freed up`);
      setAssignDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to assign vehicle');
    }
  };

  const handleDeleteConfirm = (slot) => {
    setSelectedSlot(slot);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteSlot.mutateAsync(selectedSlot.id);
      toast.success(`Slot ${selectedSlot.slotNumber} deleted!`);
      setDeleteDialogOpen(false);
      setSelectedSlot(null);
    } catch (error) {
      toast.error('Failed to delete slot');
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'available': return COLORS.success;
      case 'occupied': return COLORS.error;
      case 'reserved': return COLORS.warning;
      default: return COLORS.textSecondary;
    }
  };

  const typeIcon = (type) => {
    switch (type) {
      case 'car': return <Car className="h-4 w-4" />;
      case 'bike': return <Bike className="h-4 w-4" />;
      case 'ev': return <Zap className="h-4 w-4" />;
      default: return <ParkingCircle className="h-4 w-4" />;
    }
  };

  const SlotForm = ({ onSubmit, submitLabel, isPending }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Slot Number *</Label>
          <Input placeholder="e.g., P-001, B1-01" value={formData.slotNumber} onChange={(e) => { setFormData({...formData, slotNumber: e.target.value}); setErrors({...errors, slotNumber: null}); }} className={errors.slotNumber ? 'border-red-500' : ''} />
          {errors.slotNumber && <p className="text-xs text-red-500">{errors.slotNumber}</p>}
        </div>
        <div className="space-y-2">
          <Label>Zone / Area</Label>
          <Input placeholder="e.g., Basement 1, Ground" value={formData.zone} onChange={(e) => setFormData({...formData, zone: e.target.value})} />
        </div>
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
        <Button type="button" variant="outline" onClick={() => { setAddDialogOpen(false); setEditDialogOpen(false); }}>Cancel</Button>
        <Button type="submit" disabled={isPending} style={{ backgroundColor: COLORS.primary }} className="text-white">{isPending ? 'Saving...' : submitLabel}</Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Parking Management</h1>
          <p className="text-muted-foreground mt-1">Manage parking slots, assign vehicles, track availability</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => queryClient.invalidateQueries()}><RefreshCw className="h-4 w-4" /></Button>
          <div className="flex border rounded-md">
            <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}>Grid</Button>
            <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('table')}>Table</Button>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={(o) => { setAddDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: COLORS.primary }} className="text-white"><Plus className="h-4 w-4 mr-2" />Add Slot</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Add Parking Slot</DialogTitle></DialogHeader>
              <SlotForm onSubmit={handleAdd} submitLabel="Add Slot" isPending={createSlot.isPending} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Available</p><p className="text-2xl font-bold" style={{color: COLORS.success}}>{stats.available}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Occupied</p><p className="text-2xl font-bold" style={{color: COLORS.error}}>{stats.occupied}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Reserved</p><p className="text-2xl font-bold" style={{color: COLORS.warning}}>{stats.reserved}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Cars</p><p className="text-2xl font-bold">{stats.cars}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Bikes</p><p className="text-2xl font-bold">{stats.bikes}</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">EV</p><p className="text-2xl font-bold">{stats.ev}</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by slot, vehicle, flat, owner..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <select className="p-2 border rounded-md text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="car">Car</option>
          <option value="bike">Bike</option>
          <option value="ev">EV Charging</option>
          <option value="visitor">Visitor</option>
        </select>
        <select className="p-2 border rounded-md text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="reserved">Reserved</option>
        </select>
        {(searchQuery || filterType !== 'all' || filterStatus !== 'all') && (
          <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setFilterType('all'); setFilterStatus('all'); }}>Clear Filters</Button>
        )}
      </div>

      {/* Content */}
      <Card>
        <CardHeader><CardTitle>Parking Slots ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <ParkingCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{slots.length === 0 ? 'No parking slots configured' : 'No slots match your filters'}</p>
              {slots.length === 0 && <p className="text-sm text-muted-foreground mt-1">Click "Add Slot" to create your first parking slot</p>}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
              {filtered.map((slot) => (
                <div key={slot.id} className="p-3 border-2 rounded-lg text-center relative group" style={{ borderColor: statusColor(slot.status), backgroundColor: statusColor(slot.status) + '10' }}>
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button onClick={() => handleAssign(slot)} className="p-1 rounded bg-white shadow hover:bg-gray-100" title="Assign/Free">
                      <UserPlus className="h-3 w-3" />
                    </button>
                    <button onClick={() => handleEdit(slot)} className="p-1 rounded bg-white shadow hover:bg-gray-100" title="Edit">
                      <Edit className="h-3 w-3" />
                    </button>
                    <button onClick={() => handleDeleteConfirm(slot)} className="p-1 rounded bg-white shadow hover:bg-red-100" title="Delete">
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {typeIcon(slot.type)}
                    <p className="font-bold text-lg">{slot.slotNumber}</p>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">{slot.type}{slot.zone ? ` - ${slot.zone}` : ''}</p>
                  <Badge className="mt-1" variant={slot.status === 'available' ? 'default' : 'secondary'} style={{ backgroundColor: statusColor(slot.status), color: 'white' }}>{slot.status}</Badge>
                  {slot.vehicleNumber && <p className="text-xs font-mono mt-2 bg-white/80 rounded px-1">{slot.vehicleNumber}</p>}
                  {slot.flatNumber && <p className="text-xs text-muted-foreground mt-1">Flat: {slot.flatNumber}</p>}
                  {slot.ownerName && <p className="text-xs text-muted-foreground">{slot.ownerName}</p>}
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slot No.</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Flat</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell className="font-bold">{slot.slotNumber}</TableCell>
                    <TableCell><div className="flex items-center gap-1 capitalize">{typeIcon(slot.type)}{slot.type}</div></TableCell>
                    <TableCell>{slot.zone || '-'}</TableCell>
                    <TableCell><Badge style={{ backgroundColor: statusColor(slot.status), color: 'white' }}>{slot.status}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{slot.vehicleNumber || '-'}</TableCell>
                    <TableCell>{slot.flatNumber || '-'}</TableCell>
                    <TableCell>{slot.ownerName || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleAssign(slot)} title="Assign/Free"><UserPlus className="h-3 w-3" /></Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(slot)} title="Edit"><Edit className="h-3 w-3" /></Button>
                        <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteConfirm(slot)} title="Delete"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(o) => { setEditDialogOpen(o); if (!o) { setSelectedSlot(null); resetForm(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Slot: {selectedSlot?.slotNumber}</DialogTitle></DialogHeader>
          <SlotForm onSubmit={handleUpdate} submitLabel="Update Slot" isPending={updateSlot.isPending} />
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={(o) => { setAssignDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedSlot?.vehicleNumber ? 'Update/Free' : 'Assign Vehicle to'} Slot {selectedSlot?.slotNumber}</DialogTitle></DialogHeader>
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Vehicle Number</Label>
              <Input placeholder="e.g., MH-01-AB-1234 (leave blank to free slot)" value={formData.vehicleNumber} onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})} />
              <p className="text-xs text-muted-foreground">Leave empty to mark slot as available</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Flat Number</Label>
                <Input placeholder="e.g., A-101" value={formData.flatNumber} onChange={(e) => setFormData({...formData, flatNumber: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Owner Name</Label>
                <Input placeholder="Resident name" value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
              {selectedSlot?.vehicleNumber && (
                <Button type="button" variant="destructive" onClick={async () => {
                  await updateSlot.mutateAsync({ id: selectedSlot.id, vehicleNumber: '', flatNumber: '', ownerName: '', status: 'available' });
                  toast.success(`Slot ${selectedSlot.slotNumber} freed up`);
                  setAssignDialogOpen(false); resetForm();
                }}>Free Slot</Button>
              )}
              <Button type="submit" disabled={updateSlot.isPending} style={{ backgroundColor: COLORS.primary }} className="text-white">{updateSlot.isPending ? 'Saving...' : 'Assign'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Parking Slot</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete slot <strong>{selectedSlot?.slotNumber}</strong>?</p>
            {selectedSlot?.vehicleNumber && <p className="text-sm text-red-500">Warning: This slot has vehicle {selectedSlot.vehicleNumber} assigned.</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteSlot.isPending}>{deleteSlot.isPending ? 'Deleting...' : 'Delete'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
