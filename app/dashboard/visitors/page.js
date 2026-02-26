'use client';
import { useState } from 'react';
import { Plus, UserPlus, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { useVisitors, useCreateVisitor, useTowers, useFlats } from '@/lib/api/queries';
import { toast } from 'sonner';
import { validateForm, VALIDATION_RULES, formatMobile } from '@/lib/validation';
import { useQueryClient } from '@tanstack/react-query';

export default function VisitorsMainPage() {
  const queryClient = useQueryClient();
  const { data: visitors, isLoading } = useVisitors();
  const { data: towers } = useTowers();
  const { data: allFlats } = useFlats();
  const createVisitor = useCreateVisitor();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState({});
  const [selectedTower, setSelectedTower] = useState('');
  const [formData, setFormData] = useState({ name: '', mobile: '', flatNumber: '', purpose: '', vehicleNumber: '' });

  const flatsForTower = selectedTower ? (allFlats || []).filter(f => f.towerId === selectedTower) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: ve } = validateForm(formData, {
      name: VALIDATION_RULES.name,
      mobile: VALIDATION_RULES.mobile,
      flatNumber: { required: true, message: 'Select a flat' },
      purpose: { required: true, message: 'Purpose is required' },
    });
    if (!isValid) { setErrors(ve); return; }
    try {
      await createVisitor.mutateAsync(formData);
      toast.success('Visitor registered successfully!');
      setDialogOpen(false);
      setFormData({ name: '', mobile: '', flatNumber: '', purpose: '', vehicleNumber: '' });
      setSelectedTower('');
      setErrors({});
    } catch (error) {
      toast.error('Failed to register visitor');
    }
  };

  const filtered = (visitors || []).filter(v =>
    (v.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.mobile || '').includes(searchQuery) ||
    (v.flatNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Visitor Management</h1>
          <p className="text-muted-foreground mt-1">Track visitor entry and exit</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => queryClient.invalidateQueries()}><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: COLORS.primary }} className="text-white"><Plus className="h-4 w-4 mr-2" />Register Visitor</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Register New Visitor</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Visitor Name *</Label>
                    <Input value={formData.name} onChange={(e) => { setFormData({...formData, name: e.target.value}); setErrors({...errors, name: null}); }} className={errors.name ? 'border-red-500' : ''} placeholder="Full name" />
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile * (10 digits)</Label>
                    <Input value={formData.mobile} onChange={(e) => { setFormData({...formData, mobile: formatMobile(e.target.value)}); setErrors({...errors, mobile: null}); }} className={errors.mobile ? 'border-red-500' : ''} maxLength={10} placeholder="9876543210" />
                    {errors.mobile && <p className="text-xs text-red-500">{errors.mobile}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tower *</Label>
                    <select className="w-full p-2 border rounded-md text-sm" value={selectedTower} onChange={(e) => { setSelectedTower(e.target.value); setFormData({...formData, flatNumber: ''}); }}>
                      <option value="">Select Tower</option>
                      {towers?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Flat Number *</Label>
                    <select className={`w-full p-2 border rounded-md text-sm ${errors.flatNumber ? 'border-red-500' : ''} ${!selectedTower ? 'opacity-50' : ''}`} value={formData.flatNumber} onChange={(e) => { setFormData({...formData, flatNumber: e.target.value}); setErrors({...errors, flatNumber: null}); }} disabled={!selectedTower}>
                      <option value="">{selectedTower ? 'Select Flat' : 'Select tower first'}</option>
                      {flatsForTower.map(f => <option key={f.id} value={f.flatNumber}>{f.flatNumber}</option>)}
                    </select>
                    {errors.flatNumber && <p className="text-xs text-red-500">{errors.flatNumber}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Purpose *</Label>
                    <select className={`w-full p-2 border rounded-md text-sm ${errors.purpose ? 'border-red-500' : ''}`} value={formData.purpose} onChange={(e) => { setFormData({...formData, purpose: e.target.value}); setErrors({...errors, purpose: null}); }}>
                      <option value="">Select</option>
                      <option value="Personal">Personal</option>
                      <option value="Delivery">Delivery</option>
                      <option value="Business">Business</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.purpose && <p className="text-xs text-red-500">{errors.purpose}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Vehicle Number</Label>
                    <Input value={formData.vehicleNumber} onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value.toUpperCase()})} placeholder="MH01AB1234" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createVisitor.isPending}>{createVisitor.isPending ? 'Registering...' : 'Register Visitor'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">Total Visitors</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.primary }}>{visitors?.length || 0}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Currently Inside</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.success }}>{visitors?.filter(v => !v.exitTime).length || 0}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Pending</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.warning }}>{visitors?.filter(v => v.status === 'pending').length || 0}</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Visitors</CardTitle>
            <div className="relative w-72"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search name, mobile, flat..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="text-center py-8">Loading...</div> : filtered.length === 0 ? (
            <div className="text-center py-12"><UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No visitors found</p></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Contact</TableHead><TableHead>Flat</TableHead><TableHead>Purpose</TableHead><TableHead>Entry</TableHead><TableHead>Exit</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.slice(0, 20).map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>{v.mobile}</TableCell>
                    <TableCell>{v.flatNumber}</TableCell>
                    <TableCell>{v.purpose}</TableCell>
                    <TableCell className="text-xs">{v.entryTime ? new Date(v.entryTime).toLocaleString('en-IN') : '-'}</TableCell>
                    <TableCell className="text-xs">{v.exitTime ? new Date(v.exitTime).toLocaleString('en-IN') : '-'}</TableCell>
                    <TableCell><Badge variant={v.status === 'approved' ? 'default' : v.status === 'pending' ? 'secondary' : 'outline'}>{v.status}</Badge></TableCell>
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
