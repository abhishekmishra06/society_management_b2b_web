'use client';
import { useState, useMemo } from 'react';
import { Plus, UserCog, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { useTenants, useCreateResident, useUpdateResident, useDeleteResident, useTowers, useFlats } from '@/lib/api/queries';
import { toast } from 'sonner';
import { validateForm, VALIDATION_RULES, formatMobile } from '@/lib/validation';

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '', tower: '', flatNumber: '',
    type: 'tenant', rentAmount: '', securityDeposit: '',
    agreementStartDate: '', agreementEndDate: '', moveInDate: '',
  });

  const { data: tenants, isLoading } = useTenants();
  const { data: towers } = useTowers();
  const { data: allFlats } = useFlats();
  const createTenant = useCreateResident();
  const updateTenant = useUpdateResident();
  const deleteTenant = useDeleteResident();

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
      if (editingTenant) {
        await updateTenant.mutateAsync({ id: editingTenant.id, data: formData });
        toast.success('Tenant updated successfully!');
      } else {
        await createTenant.mutateAsync(formData);
        toast.success('Tenant added successfully!');
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save tenant');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', mobile: '', tower: '', flatNumber: '', type: 'tenant', rentAmount: '', securityDeposit: '', agreementStartDate: '', agreementEndDate: '', moveInDate: '' });
    setEditingTenant(null);
    setErrors({});
  };

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setFormData({ ...tenant });
    setErrors({});
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this tenant?')) {
      try {
        await deleteTenant.mutateAsync(id);
        toast.success('Tenant deleted!');
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const filteredTenants = tenants?.filter(t =>
    (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.flatNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.mobile || '').includes(searchQuery)
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Tenant Management</h1>
          <p className="text-muted-foreground mt-1">Track rent agreements, duration, and deposits</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: COLORS.primary }} className="text-white" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTenant ? 'Edit Tenant' : 'Add New Tenant'}</DialogTitle>
              <DialogDescription>Fill all required fields with valid data</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input value={formData.name} onChange={(e) => { setFormData({...formData, name: e.target.value}); setErrors({...errors, name: null}); }} className={errors.name ? 'border-red-500' : ''} placeholder="e.g., John Doe" />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={formData.email} onChange={(e) => { setFormData({...formData, email: e.target.value}); setErrors({...errors, email: null}); }} className={errors.email ? 'border-red-500' : ''} placeholder="e.g., john@example.com" />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
              </div>

              {/* Mobile */}
              <div className="space-y-2">
                <Label>Mobile Number * (10 digits)</Label>
                <Input value={formData.mobile} onChange={(e) => { setFormData({...formData, mobile: formatMobile(e.target.value)}); setErrors({...errors, mobile: null}); }} className={errors.mobile ? 'border-red-500' : ''} placeholder="e.g., 9876543210" maxLength={10} />
                {errors.mobile && <p className="text-xs text-red-500">{errors.mobile}</p>}
              </div>

              {/* Tower -> Flat Cascading */}
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

              {/* Rent & Deposit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monthly Rent (Rs.)</Label>
                  <Input type="number" min="0" value={formData.rentAmount} onChange={(e) => setFormData({...formData, rentAmount: e.target.value})} placeholder="e.g., 15000" />
                </div>
                <div className="space-y-2">
                  <Label>Security Deposit (Rs.)</Label>
                  <Input type="number" min="0" value={formData.securityDeposit} onChange={(e) => setFormData({...formData, securityDeposit: e.target.value})} placeholder="e.g., 50000" />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Move-in Date</Label>
                  <Input type="date" value={formData.moveInDate} onChange={(e) => setFormData({...formData, moveInDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Agreement Start</Label>
                  <Input type="date" value={formData.agreementStartDate} onChange={(e) => setFormData({...formData, agreementStartDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Agreement End</Label>
                  <Input type="date" value={formData.agreementEndDate} onChange={(e) => setFormData({...formData, agreementEndDate: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createTenant.isPending || updateTenant.isPending}>
                  {editingTenant ? 'Update Tenant' : 'Add Tenant'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Tenants ({filteredTenants.length})</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search name, flat, mobile..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredTenants.length === 0 ? (
            <div className="text-center py-12">
              <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tenants found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Flat</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Agreement</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>{tenant.flatNumber}</TableCell>
                    <TableCell>{tenant.mobile}</TableCell>
                    <TableCell className="text-sm">{tenant.email}</TableCell>
                    <TableCell>{tenant.rentAmount ? `Rs. ${Number(tenant.rentAmount).toLocaleString('en-IN')}` : 'N/A'}</TableCell>
                    <TableCell className="text-xs">
                      {tenant.agreementStartDate ? `${new Date(tenant.agreementStartDate).toLocaleDateString('en-IN')} - ${tenant.agreementEndDate ? new Date(tenant.agreementEndDate).toLocaleDateString('en-IN') : 'Ongoing'}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(tenant)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tenant.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
