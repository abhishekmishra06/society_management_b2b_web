'use client';
import { useState } from 'react';
import { Plus, Briefcase, Search, RefreshCw, Edit, Trash2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { useStaff, useCreateStaff } from '@/lib/api/queries';
import { toast } from 'sonner';
import { validateForm, VALIDATION_RULES, formatMobile } from '@/lib/validation';
import { useQueryClient } from '@tanstack/react-query';
import ShareAccessDialog from '@/components/ShareAccessDialog';

export default function StaffPage() {
  const queryClient = useQueryClient();
  const { data: staff, isLoading } = useStaff();
  const createStaff = useCreateStaff();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ name: '', role: '', mobile: '', email: '', shift: 'day', salary: '', aadhar: '' });
  const [shareAccessOpen, setShareAccessOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: ve } = validateForm(formData, {
      name: VALIDATION_RULES.name,
      role: { required: true, message: 'Role is required' },
      mobile: VALIDATION_RULES.mobile,
    });
    if (!isValid) { setErrors(ve); return; }
    try {
      await createStaff.mutateAsync(formData);
      toast.success('Staff member added!');
      setDialogOpen(false);
      setFormData({ name: '', role: '', mobile: '', email: '', shift: 'day', salary: '', aadhar: '' });
      setErrors({});
    } catch (error) {
      toast.error('Failed to add staff');
    }
  };

  const filtered = (staff || []).filter(s =>
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.mobile || '').includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Staff Management</h1>
          <p className="text-muted-foreground mt-1">Manage society staff members</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => queryClient.invalidateQueries()}><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button style={{ backgroundColor: COLORS.primary }} className="text-white"><Plus className="h-4 w-4 mr-2" />Add Staff</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input value={formData.name} onChange={(e) => { setFormData({...formData, name: e.target.value}); setErrors({...errors, name: null}); }} className={errors.name ? 'border-red-500' : ''} placeholder="Full name" />
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Role *</Label>
                    <select className={`w-full p-2 border rounded-md text-sm ${errors.role ? 'border-red-500' : ''}`} value={formData.role} onChange={(e) => { setFormData({...formData, role: e.target.value}); setErrors({...errors, role: null}); }}>
                      <option value="">Select Role</option>
                      <option value="security">Security Guard</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="housekeeping">Housekeeping</option>
                      <option value="gardener">Gardener</option>
                      <option value="plumber">Plumber</option>
                      <option value="electrician">Electrician</option>
                      <option value="manager">Manager</option>
                    </select>
                    {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mobile * (10 digits)</Label>
                    <Input value={formData.mobile} onChange={(e) => { setFormData({...formData, mobile: formatMobile(e.target.value)}); setErrors({...errors, mobile: null}); }} className={errors.mobile ? 'border-red-500' : ''} maxLength={10} placeholder="9876543210" />
                    {errors.mobile && <p className="text-xs text-red-500">{errors.mobile}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="staff@email.com" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Shift</Label>
                    <select className="w-full p-2 border rounded-md text-sm" value={formData.shift} onChange={(e) => setFormData({...formData, shift: e.target.value})}>
                      <option value="day">Day (6AM-6PM)</option>
                      <option value="night">Night (6PM-6AM)</option>
                      <option value="morning">Morning (6AM-2PM)</option>
                      <option value="evening">Evening (2PM-10PM)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Salary</Label>
                    <Input type="number" min="0" value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} placeholder="15000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Aadhaar Number</Label>
                    <Input value={formData.aadhar} onChange={(e) => setFormData({...formData, aadhar: e.target.value.replace(/\D/g, '').slice(0, 12)})} maxLength={12} placeholder="12 digits" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createStaff.isPending}>{createStaff.isPending ? 'Adding...' : 'Add Staff'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm">Total Staff</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{staff?.length || 0}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Active</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.success }}>{staff?.filter(s => s.status === 'active').length || 0}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Security</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{staff?.filter(s => s.role === 'security').length || 0}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Maintenance</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{staff?.filter(s => s.role === 'maintenance').length || 0}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Staff ({filtered.length})</CardTitle>
            <div className="relative w-72"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search staff..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="text-center py-8">Loading...</div> : filtered.length === 0 ? (
            <div className="text-center py-12"><Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No staff members found</p></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Mobile</TableHead><TableHead>Shift</TableHead><TableHead>Salary</TableHead><TableHead>Joined</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="capitalize">{m.role}</TableCell>
                    <TableCell>{m.mobile}</TableCell>
                    <TableCell className="capitalize">{m.shift || 'N/A'}</TableCell>
                    <TableCell>{m.salary ? `Rs. ${Number(m.salary).toLocaleString('en-IN')}` : 'N/A'}</TableCell>
                    <TableCell className="text-xs">{m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('en-IN') : 'N/A'}</TableCell>
                    <TableCell><Badge variant={m.status === 'active' ? 'default' : 'secondary'}>{m.status || 'active'}</Badge></TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedStaff(m); setShareAccessOpen(true); }} title="Share Access">
                        <KeyRound className="h-3 w-3 mr-1" />Access
                      </Button>
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
