'use client';
import { useState, useMemo } from 'react';
import { Plus, Search, UserCheck, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { useOwners, useCreateResident, useUpdateResident, useDeleteResident, useTowers, useFlats } from '@/lib/api/queries';
import { toast } from 'sonner';
import { validateForm, VALIDATION_RULES, formatMobile } from '@/lib/validation';

export default function OwnersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '', tower: '', flatNumber: '', type: 'owner', moveInDate: '',
  });

  const { data: owners, isLoading } = useOwners();
  const { data: towers } = useTowers();
  const { data: allFlats } = useFlats();
  const createOwner = useCreateResident();
  const updateOwner = useUpdateResident();
  const deleteOwner = useDeleteResident();

  // Cascading: filter flats by selected tower
  const flatsForSelectedTower = useMemo(() => {
    if (!formData.tower || !allFlats) return [];
    return allFlats.filter(f => f.towerId === formData.tower);
  }, [formData.tower, allFlats]);

  const handleTowerChange = (towerId) => {
    setFormData({ ...formData, tower: towerId, flatNumber: '' });
    setErrors({ ...errors, tower: null, flatNumber: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validateForm(formData, {
      name: VALIDATION_RULES.name,
      email: VALIDATION_RULES.email,
      mobile: VALIDATION_RULES.mobile,
      tower: { required: true, message: 'Please select a tower' },
      flatNumber: { required: true, message: 'Please select a flat' },
    });
    if (!isValid) { setErrors(validationErrors); return; }

    try {
      if (editingOwner) {
        await updateOwner.mutateAsync({ id: editingOwner.id, data: formData });
        toast.success('Owner updated!');
      } else {
        await createOwner.mutateAsync(formData);
        toast.success('Owner added!');
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save owner');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', mobile: '', tower: '', flatNumber: '', type: 'owner', moveInDate: '' });
    setEditingOwner(null);
    setErrors({});
  };

  const handleEdit = (owner) => {
    setEditingOwner(owner);
    setFormData({ ...owner });
    setErrors({});
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this owner?')) {
      try { await deleteOwner.mutateAsync(id); toast.success('Owner deleted!'); }
      catch { toast.error('Failed to delete'); }
    }
  };

  const filteredOwners = owners?.filter(o =>
    (o.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.flatNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.mobile || '').includes(searchQuery)
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Owner Management</h1>
          <p className="text-muted-foreground mt-1">Manage flat owners with ownership details</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: COLORS.primary }} className="text-white" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />Add Owner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editingOwner ? 'Edit Owner' : 'Add Owner'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input value={formData.name} onChange={(e) => { setFormData({...formData, name: e.target.value}); setErrors({...errors, name: null}); }} className={errors.name ? 'border-red-500' : ''} placeholder="e.g., John Doe" />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={formData.email} onChange={(e) => { setFormData({...formData, email: e.target.value}); setErrors({...errors, email: null}); }} className={errors.email ? 'border-red-500' : ''} placeholder="e.g., john@email.com" />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mobile Number * (10 digits)</Label>
                <Input value={formData.mobile} onChange={(e) => { setFormData({...formData, mobile: formatMobile(e.target.value)}); setErrors({...errors, mobile: null}); }} className={errors.mobile ? 'border-red-500' : ''} placeholder="e.g., 9876543210" maxLength={10} />
                {errors.mobile && <p className="text-xs text-red-500">{errors.mobile}</p>}
              </div>
              {/* Cascading Tower -> Flat */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tower *</Label>
                  <select className={`w-full p-2 border rounded-md text-sm ${errors.tower ? 'border-red-500' : ''}`} value={formData.tower} onChange={(e) => handleTowerChange(e.target.value)}>
                    <option value="">Select Tower</option>
                    {towers?.map(t => <option key={t.id} value={t.id}>{t.name} ({t.floors} floors)</option>)}
                  </select>
                  {errors.tower && <p className="text-xs text-red-500">{errors.tower}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Flat Number *</Label>
                  <select className={`w-full p-2 border rounded-md text-sm ${errors.flatNumber ? 'border-red-500' : ''} ${!formData.tower ? 'opacity-50' : ''}`} value={formData.flatNumber} onChange={(e) => { setFormData({...formData, flatNumber: e.target.value}); setErrors({...errors, flatNumber: null}); }} disabled={!formData.tower}>
                    <option value="">{formData.tower ? 'Select Flat' : 'Select tower first'}</option>
                    {flatsForSelectedTower.map(f => (
                      <option key={f.id} value={f.flatNumber}>{f.flatNumber} - Floor {f.floor} - {f.bhk} BHK ({f.occupancyStatus})</option>
                    ))}
                  </select>
                  {errors.flatNumber && <p className="text-xs text-red-500">{errors.flatNumber}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ownership Since</Label>
                <Input type="date" value={formData.moveInDate} onChange={(e) => setFormData({...formData, moveInDate: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingOwner ? 'Update' : 'Add'} Owner</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Owners ({filteredOwners.length})</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search name, flat, mobile..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredOwners.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No owners found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Flat</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Since</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOwners.map((owner) => (
                  <TableRow key={owner.id}>
                    <TableCell className="font-medium">{owner.name}</TableCell>
                    <TableCell>{owner.flatNumber}</TableCell>
                    <TableCell>{owner.mobile}</TableCell>
                    <TableCell className="text-sm">{owner.email}</TableCell>
                    <TableCell>{owner.moveInDate ? new Date(owner.moveInDate).toLocaleDateString('en-IN') : 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(owner)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(owner.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
