'use client';
import { useState } from 'react';
import { Plus, UserCog, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { useTenants, useCreateResident, useUpdateResident, useDeleteResident, useTowers } from '@/lib/api/queries';
import { toast } from 'sonner';

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    tower: '',
    flatNumber: '',
    type: 'tenant',
    rentAmount: '',
    securityDeposit: '',
    agreementStartDate: '',
    agreementEndDate: '',
    moveInDate: '',
  });

  const { data: tenants, isLoading } = useTenants();
  const { data: towers } = useTowers();
  const createTenant = useCreateResident();
  const updateTenant = useUpdateResident();
  const deleteTenant = useDeleteResident();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTenant) {
        await updateTenant.mutateAsync({ id: editingTenant.id, data: formData });
        toast.success('Tenant updated successfully!');
      } else {
        await createTenant.mutateAsync(formData);
        toast.success('Tenant added successfully!');
      }
      setDialogOpen(false);
      setFormData({
        name: '',
        email: '',
        mobile: '',
        tower: '',
        flatNumber: '',
        type: 'tenant',
        rentAmount: '',
        securityDeposit: '',
        agreementStartDate: '',
        agreementEndDate: '',
        moveInDate: '',
      });
      setEditingTenant(null);
    } catch (error) {
      toast.error('Failed to save tenant');
      console.error(error);
    }
  };

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setFormData(tenant);
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
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.flatNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Tenant Management</h1>
          <p className="text-muted-foreground mt-1">Track rent agreements, duration, and deposits</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: COLORS.primary }} onClick={() => { 
              setEditingTenant(null); 
              setFormData({
                name: '',
                email: '',
                mobile: '',
                tower: '',
                flatNumber: '',
                type: 'tenant',
                rentAmount: '',
                securityDeposit: '',
                agreementStartDate: '',
                agreementEndDate: '',
                moveInDate: '',
              }); 
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTenant ? 'Edit Tenant' : 'Add New Tenant'}</DialogTitle>
              <DialogDescription>Rent agreement tracking with duration and deposit</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mobile *</Label>
                  <Input value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Tower *</Label>
                  <select className="w-full p-2 border rounded-md" value={formData.tower} onChange={(e) => setFormData({...formData, tower: e.target.value})} required>
                    <option value="">Select Tower</option>
                    {towers?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Flat Number *</Label>
                  <Input value={formData.flatNumber} onChange={(e) => setFormData({...formData, flatNumber: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Rent</Label>
                  <Input type="number" value={formData.rentAmount} onChange={(e) => setFormData({...formData, rentAmount: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Security Deposit</Label>
                  <Input type="number" value={formData.securityDeposit} onChange={(e) => setFormData({...formData, securityDeposit: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Move-in Date</Label>
                  <Input type="date" value={formData.moveInDate} onChange={(e) => setFormData({...formData, moveInDate: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Agreement Start</Label>
                  <Input type="date" value={formData.agreementStartDate} onChange={(e) => setFormData({...formData, agreementStartDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Agreement End</Label>
                  <Input type="date" value={formData.agreementEndDate} onChange={(e) => setFormData({...formData, agreementEndDate: e.target.value})} />
                </div>
              </div>
              <Button type="submit" disabled={createTenant.isPending || updateTenant.isPending}>
                {editingTenant ? 'Update' : 'Add'} Tenant
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Tenants ({filteredTenants.length})</CardTitle>
            <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64" />
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
                  <TableHead>Contact</TableHead>
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
                    <TableCell>₹{tenant.rentAmount || 'N/A'}</TableCell>
                    <TableCell className="text-xs">
                      {tenant.agreementStartDate ? `${new Date(tenant.agreementStartDate).toLocaleDateString()} - ${new Date(tenant.agreementEndDate).toLocaleDateString()}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(tenant)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tenant.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
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
