'use client';
import { useState } from 'react';
import { Plus, Search, UserCheck, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { useOwners, useCreateResident, useUpdateResident, useDeleteResident, useTowers } from '@/lib/api/queries';
import { toast } from 'sonner';

export default function OwnersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    tower: '',
    flatNumber: '',
    type: 'owner',
    moveInDate: '',
  });

  const { data: owners, isLoading } = useOwners();
  const { data: towers } = useTowers();
  const createOwner = useCreateResident();
  const updateOwner = useUpdateResident();
  const deleteOwner = useDeleteResident();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOwner) {
        await updateOwner.mutateAsync({ id: editingOwner.id, data: formData });
        toast.success('Owner updated successfully!');
      } else {
        await createOwner.mutateAsync(formData);
        toast.success('Owner added successfully!');
      }
      setDialogOpen(false);
      setFormData({ name: '', email: '', mobile: '', tower: '', flatNumber: '', type: 'owner', moveInDate: '' });
      setEditingOwner(null);
    } catch (error) {
      toast.error('Failed to save owner');
    }
  };

  const handleEdit = (owner) => {
    setEditingOwner(owner);
    setFormData(owner);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        await deleteOwner.mutateAsync(id);
        toast.success('Owner deleted!');
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const filteredOwners = owners?.filter(o => 
    o.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.flatNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Owner Management</h1>
          <p className="text-muted-foreground mt-1">Manage flat owners with ownership details</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: COLORS.primary }} onClick={() => { setEditingOwner(null); setFormData({ name: '', email: '', mobile: '', tower: '', flatNumber: '', type: 'owner', moveInDate: '' }); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Owner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingOwner ? 'Edit Owner' : 'Add Owner'}</DialogTitle>
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
                  <Label>Ownership Since</Label>
                  <Input type="date" value={formData.moveInDate} onChange={(e) => setFormData({...formData, moveInDate: e.target.value})} />
                </div>
              </div>
              <Button type="submit">{editingOwner ? 'Update' : 'Add'} Owner</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Owners ({filteredOwners.length})</CardTitle>
            <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64" />
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
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOwners.map((owner) => (
                  <TableRow key={owner.id}>
                    <TableCell className="font-medium">{owner.name}</TableCell>
                    <TableCell>{owner.flatNumber}</TableCell>
                    <TableCell>{owner.mobile}</TableCell>
                    <TableCell>{owner.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(owner)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(owner.id)}>
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
