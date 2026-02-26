'use client';
import { useState } from 'react';
import { Plus, Search, Filter, UserX, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { COLORS, STATUS_COLORS } from '@/lib/constants/colors';
import { useResidents, useCreateResident, useUpdateResident, useDeleteResident } from '@/lib/api/queries';
import ResidentForm from '@/components/residents/ResidentForm';
import { toast } from 'sonner';

export default function ResidentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResident, setEditingResident] = useState(null);

  const { data: residents, isLoading } = useResidents();
  const createResident = useCreateResident();
  const updateResident = useUpdateResident();
  const deleteResident = useDeleteResident();

  const handleAddResident = async (data) => {
    try {
      await createResident.mutateAsync(data);
      toast.success('Resident added successfully!');
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add resident');
    }
  };

  const handleUpdateResident = async (data) => {
    try {
      await updateResident.mutateAsync({ id: editingResident.id, data });
      toast.success('Resident updated successfully!');
      setDialogOpen(false);
      setEditingResident(null);
    } catch (error) {
      toast.error('Failed to update resident');
    }
  };

  const handleDeleteResident = async (id) => {
    if (confirm('Are you sure you want to delete this resident?')) {
      try {
        await deleteResident.mutateAsync(id);
        toast.success('Resident deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete resident');
      }
    }
  };

  const filteredResidents = residents?.filter(r => 
    r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.flatNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Resident Management</h1>
          <p className="text-muted-foreground mt-1">Manage all residents in your society</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: COLORS.primary }} onClick={() => setEditingResident(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Resident
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingResident ? 'Edit Resident' : 'Add New Resident'}</DialogTitle>
              <DialogDescription>
                {editingResident ? 'Update resident information' : 'Add a new resident to the society'}
              </DialogDescription>
            </DialogHeader>
            <ResidentForm 
              onSubmit={editingResident ? handleUpdateResident : handleAddResident}
              initialData={editingResident}
              isLoading={createResident.isPending || updateResident.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Residents ({filteredResidents.length})</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search residents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading residents...</div>
          ) : filteredResidents.length === 0 ? (
            <div className="text-center py-12">
              <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No residents found</p>
              <Button
                className="mt-4"
                style={{ backgroundColor: COLORS.primary }}
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Resident
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Flat</TableHead>
                  <TableHead>Tower</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResidents.map((resident) => (
                  <TableRow key={resident.id}>
                    <TableCell className="font-medium">{resident.name || 'N/A'}</TableCell>
                    <TableCell>{resident.flatNumber || 'N/A'}</TableCell>
                    <TableCell>{resident.tower || 'N/A'}</TableCell>
                    <TableCell>{resident.mobile || 'N/A'}</TableCell>
                    <TableCell>{resident.email || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{resident.type || 'resident'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        style={{ 
                          backgroundColor: resident.status === 'active' ? STATUS_COLORS.active + '20' : STATUS_COLORS.inactive + '20',
                          color: resident.status === 'active' ? STATUS_COLORS.active : STATUS_COLORS.inactive,
                        }}
                      >
                        {resident.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingResident(resident);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteResident(resident.id)}
                        >
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
