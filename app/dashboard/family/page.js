'use client';
import { Plus, UsersRound, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { COLORS } from '@/lib/constants/colors';
import { useResidents } from '@/lib/api/queries';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export default function FamilyPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'spouse',
    age: '',
    mobile: '',
  });
  const [familyMembers, setFamilyMembers] = useState([]);

  const { data: residents } = useResidents();

  const loadFamilyMembers = async (residentId) => {
    try {
      const { data } = await apiClient.get(API_ENDPOINTS.GET_FAMILY_MEMBERS(residentId));
      setFamilyMembers(data);
    } catch (error) {
      console.error('Failed to load family members', error);
    }
  };

  const handleResidentChange = (residentId) => {
    setSelectedResident(residentId);
    if (residentId) {
      loadFamilyMembers(residentId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedResident) {
      toast.error('Please select a resident');
      return;
    }
    try {
      await apiClient.post(API_ENDPOINTS.ADD_FAMILY_MEMBER(selectedResident), formData);
      toast.success('Family member added successfully!');
      setDialogOpen(false);
      setFormData({ name: '', relationship: 'spouse', age: '', mobile: '' });
      loadFamilyMembers(selectedResident);
    } catch (error) {
      toast.error('Failed to add family member');
    }
  };

  const handleDelete = async (memberId) => {
    if (confirm('Are you sure?')) {
      try {
        await apiClient.delete(API_ENDPOINTS.DELETE_FAMILY_MEMBER(selectedResident, memberId));
        toast.success('Family member deleted!');
        loadFamilyMembers(selectedResident);
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Family Member Management</h1>
          <p className="text-muted-foreground mt-1">Spouse, children, parents, emergency contact</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: COLORS.primary }} disabled={!selectedResident}>
              <Plus className="h-4 w-4 mr-2" />
              Add Family Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Family Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Relationship *</Label>
                  <select className="w-full p-2 border rounded-md" value={formData.relationship} onChange={(e) => setFormData({...formData, relationship: e.target.value})}>
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mobile</Label>
                <Input value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
              </div>
              <Button type="submit">Add Member</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Resident</CardTitle>
        </CardHeader>
        <CardContent>
          <select 
            className="w-full p-2 border rounded-md"
            value={selectedResident}
            onChange={(e) => handleResidentChange(e.target.value)}
          >
            <option value="">-- Select a Resident --</option>
            {residents?.map(r => (
              <option key={r.id} value={r.id}>{r.name} - {r.flatNumber}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedResident && (
        <Card>
          <CardHeader>
            <CardTitle>Family Members ({familyMembers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {familyMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No family members added yet</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Relationship</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {familyMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell className="capitalize">{member.relationship}</TableCell>
                      <TableCell>{member.age || 'N/A'}</TableCell>
                      <TableCell>{member.mobile || 'N/A'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
