'use client';
import { useState } from 'react';
import { Plus, AlertCircle, Search, RefreshCw, Filter, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { useComplaints, useCreateComplaint, useUpdateComplaint, useTowers, useFlats } from '@/lib/api/queries';
import { toast } from 'sonner';
import { validateForm, VALIDATION_RULES, formatMobile } from '@/lib/validation';
import { useQueryClient } from '@tanstack/react-query';

export default function ComplaintsPage() {
  const queryClient = useQueryClient();
  const { data: complaintsFromAPI, isLoading } = useComplaints();
  const { data: towers } = useTowers();
  const { data: allFlats } = useFlats();
  const createComplaint = useCreateComplaint();
  const updateComplaint = useUpdateComplaint();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [selectedTower, setSelectedTower] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ title: '', description: '', category: '', flatNumber: '', priority: 'medium', contactName: '', contactMobile: '' });

  const dummyComplaints = [
    { id: '1', title: 'Water leakage', description: 'Water leaking from ceiling', category: 'Plumbing', flatNumber: 'A-101', priority: 'high', status: 'open', contactName: 'John Doe', contactMobile: '9876543210', createdAt: '2026-02-28T10:00:00' },
    { id: '2', title: 'Elevator not working', description: 'Elevator stuck on 3rd floor', category: 'Maintenance', flatNumber: 'B-201', priority: 'high', status: 'in_progress', contactName: 'Jane Smith', contactMobile: '9876543211', createdAt: '2026-02-27T14:00:00' },
    { id: '3', title: 'Noise complaint', description: 'Loud music after 10 PM', category: 'General', flatNumber: 'A-103', priority: 'low', status: 'resolved', contactName: 'Bob Wilson', contactMobile: '9876543212', createdAt: '2026-02-25T20:00:00' },
  ];

  const complaints = (complaintsFromAPI && complaintsFromAPI.length > 0) ? complaintsFromAPI : dummyComplaints;
  const flatsForTower = selectedTower ? (allFlats || []).filter(f => f.towerId === selectedTower) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: ve } = validateForm(formData, {
      title: { required: true, minLength: 3, message: 'Title is required (min 3 chars)' },
      description: { required: true, minLength: 10, message: 'Description is required (min 10 chars)' },
      category: { required: true, message: 'Select a category' },
      flatNumber: { required: true, message: 'Select a flat' },
      contactName: VALIDATION_RULES.name,
      contactMobile: VALIDATION_RULES.mobile,
    });
    if (!isValid) { setErrors(ve); return; }
    try {
      await createComplaint.mutateAsync(formData);
      toast.success('Complaint submitted!');
      setDialogOpen(false);
      setFormData({ title: '', description: '', category: '', flatNumber: '', priority: 'medium', contactName: '', contactMobile: '' });
      setSelectedTower('');
      setErrors({});
    } catch (error) {
      toast.error('Failed to submit complaint');
    }
  };

  const handleStatusChange = async (complaint, newStatus) => {
    try {
      await updateComplaint.mutateAsync({ id: complaint.id, data: { status: newStatus } });
      toast.success(`Status changed to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filtered = complaints.filter(c => {
    const matchSearch = (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || (c.flatNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) || (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = !filterStatus || c.status === filterStatus;
    const matchCategory = !filterCategory || c.category === filterCategory;
    const matchPriority = !filterPriority || c.priority === filterPriority;
    return matchSearch && matchStatus && matchCategory && matchPriority;
  });

  const statusColors = { open: COLORS.error, in_progress: COLORS.warning, resolved: COLORS.success, closed: COLORS.textSecondary };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Complaint Management</h1>
          <p className="text-muted-foreground mt-1">Track and resolve resident complaints</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => queryClient.invalidateQueries()}><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button style={{ backgroundColor: COLORS.primary }} className="text-white"><Plus className="h-4 w-4 mr-2" />New Complaint</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Submit New Complaint</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={formData.title} onChange={(e) => { setFormData({...formData, title: e.target.value}); setErrors({...errors, title: null}); }} className={errors.title ? 'border-red-500' : ''} placeholder="Brief complaint title" />
                  {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea value={formData.description} onChange={(e) => { setFormData({...formData, description: e.target.value}); setErrors({...errors, description: null}); }} className={errors.description ? 'border-red-500' : ''} placeholder="Describe the issue in detail..." rows={4} />
                  {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <select className={`w-full p-2 border rounded-md text-sm ${errors.category ? 'border-red-500' : ''}`} value={formData.category} onChange={(e) => { setFormData({...formData, category: e.target.value}); setErrors({...errors, category: null}); }}>
                      <option value="">Select</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Security">Security</option>
                      <option value="Cleanliness">Cleanliness</option>
                      <option value="Noise">Noise</option>
                      <option value="General">General</option>
                    </select>
                    {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <select className="w-full p-2 border rounded-md text-sm" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tower</Label>
                    <select className="w-full p-2 border rounded-md text-sm" value={selectedTower} onChange={(e) => { setSelectedTower(e.target.value); setFormData({...formData, flatNumber: ''}); }}>
                      <option value="">Select Tower</option>
                      {towers?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Flat *</Label>
                    <select className={`w-full p-2 border rounded-md text-sm ${errors.flatNumber ? 'border-red-500' : ''}`} value={formData.flatNumber} onChange={(e) => { setFormData({...formData, flatNumber: e.target.value}); setErrors({...errors, flatNumber: null}); }} disabled={!selectedTower}>
                      <option value="">{selectedTower ? 'Select' : 'Tower first'}</option>
                      {flatsForTower.map(f => <option key={f.id} value={f.flatNumber}>{f.flatNumber}</option>)}
                    </select>
                    {errors.flatNumber && <p className="text-xs text-red-500">{errors.flatNumber}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Your Name *</Label>
                    <Input value={formData.contactName} onChange={(e) => { setFormData({...formData, contactName: e.target.value}); setErrors({...errors, contactName: null}); }} className={errors.contactName ? 'border-red-500' : ''} placeholder="Your name" />
                    {errors.contactName && <p className="text-xs text-red-500">{errors.contactName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile *</Label>
                    <Input value={formData.contactMobile} onChange={(e) => { setFormData({...formData, contactMobile: formatMobile(e.target.value)}); setErrors({...errors, contactMobile: null}); }} className={errors.contactMobile ? 'border-red-500' : ''} maxLength={10} placeholder="9876543210" />
                    {errors.contactMobile && <p className="text-xs text-red-500">{errors.contactMobile}</p>}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createComplaint.isPending}>{createComplaint.isPending ? 'Submitting...' : 'Submit Complaint'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm">Total</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{complaints.length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Open</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.error }}>{complaints.filter(c => c.status === 'open').length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">In Progress</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.warning }}>{complaints.filter(c => c.status === 'in_progress').length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Resolved</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.success }}>{complaints.filter(c => c.status === 'resolved').length}</p></CardContent></Card>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search complaints..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
        <select className="p-2 border rounded-md text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}><option value="">All Status</option><option value="open">Open</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option></select>
        <select className="p-2 border rounded-md text-sm" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}><option value="">All Categories</option><option value="Plumbing">Plumbing</option><option value="Electrical">Electrical</option><option value="Maintenance">Maintenance</option><option value="Security">Security</option><option value="General">General</option></select>
        <select className="p-2 border rounded-md text-sm" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}><option value="">All Priority</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
      </div>

      <Card>
        <CardHeader><CardTitle>Complaints ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <div className="text-center py-8">Loading...</div> : filtered.length === 0 ? (
            <div className="text-center py-12"><AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No complaints found</p></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Flat</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell>{c.category}</TableCell>
                    <TableCell>{c.flatNumber}</TableCell>
                    <TableCell><Badge variant={c.priority === 'high' ? 'destructive' : 'secondary'}>{c.priority}</Badge></TableCell>
                    <TableCell><Badge style={{ backgroundColor: (statusColors[c.status] || COLORS.primary) + '20', color: statusColors[c.status] || COLORS.primary }}>{c.status?.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="text-xs">{new Date(c.createdAt).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {c.status === 'open' && <Button size="sm" variant="outline" onClick={() => handleStatusChange(c, 'in_progress')} className="text-xs"><ArrowRight className="h-3 w-3 mr-1" />Start</Button>}
                        {c.status === 'in_progress' && <Button size="sm" variant="outline" onClick={() => handleStatusChange(c, 'resolved')} className="text-xs text-green-600">Resolve</Button>}
                        {c.status === 'resolved' && <Button size="sm" variant="outline" onClick={() => handleStatusChange(c, 'closed')} className="text-xs">Close</Button>}
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
