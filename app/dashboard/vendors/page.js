'use client';
import { useState } from 'react';
import { Plus, Store, Search, RefreshCw, Edit, Trash2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { useVendors, useCreateVendor } from '@/lib/api/queries';
import { toast } from 'sonner';
import { validateForm, VALIDATION_RULES, formatMobile } from '@/lib/validation';
import { useQueryClient } from '@tanstack/react-query';
import ShareAccessDialog from '@/components/ShareAccessDialog';

export default function VendorsPage() {
  const queryClient = useQueryClient();
  const { data: vendors, isLoading } = useVendors();
  const createVendor = useCreateVendor();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ companyName: '', serviceType: '', contactPerson: '', mobile: '', email: '', address: '' });
  const [shareAccessOpen, setShareAccessOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: ve } = validateForm(formData, {
      companyName: { required: true, minLength: 2, message: 'Company name is required' },
      serviceType: { required: true, message: 'Service type is required' },
      contactPerson: VALIDATION_RULES.name,
      mobile: VALIDATION_RULES.mobile,
      email: VALIDATION_RULES.email,
    });
    if (!isValid) { setErrors(ve); return; }
    try {
      await createVendor.mutateAsync(formData);
      toast.success('Vendor added!');
      setDialogOpen(false);
      setFormData({ companyName: '', serviceType: '', contactPerson: '', mobile: '', email: '', address: '' });
      setErrors({});
    } catch (error) {
      toast.error('Failed to add vendor');
    }
  };

  const filtered = (vendors || []).filter(v =>
    (v.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.serviceType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.contactPerson || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Vendor Management</h1>
          <p className="text-muted-foreground mt-1">Manage service vendors and contracts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => queryClient.invalidateQueries()}><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button style={{ backgroundColor: COLORS.primary }} className="text-white"><Plus className="h-4 w-4 mr-2" />Add Vendor</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Vendor</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name *</Label>
                    <Input value={formData.companyName} onChange={(e) => { setFormData({...formData, companyName: e.target.value}); setErrors({...errors, companyName: null}); }} className={errors.companyName ? 'border-red-500' : ''} placeholder="ABC Services" />
                    {errors.companyName && <p className="text-xs text-red-500">{errors.companyName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Service Type *</Label>
                    <select className={`w-full p-2 border rounded-md text-sm ${errors.serviceType ? 'border-red-500' : ''}`} value={formData.serviceType} onChange={(e) => { setFormData({...formData, serviceType: e.target.value}); setErrors({...errors, serviceType: null}); }}>
                      <option value="">Select</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="security">Security</option>
                      <option value="gardening">Gardening</option>
                      <option value="pest_control">Pest Control</option>
                      <option value="elevator">Elevator Maintenance</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.serviceType && <p className="text-xs text-red-500">{errors.serviceType}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contact Person *</Label>
                    <Input value={formData.contactPerson} onChange={(e) => { setFormData({...formData, contactPerson: e.target.value}); setErrors({...errors, contactPerson: null}); }} className={errors.contactPerson ? 'border-red-500' : ''} placeholder="Full name" />
                    {errors.contactPerson && <p className="text-xs text-red-500">{errors.contactPerson}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile *</Label>
                    <Input value={formData.mobile} onChange={(e) => { setFormData({...formData, mobile: formatMobile(e.target.value)}); setErrors({...errors, mobile: null}); }} className={errors.mobile ? 'border-red-500' : ''} maxLength={10} placeholder="9876543210" />
                    {errors.mobile && <p className="text-xs text-red-500">{errors.mobile}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={formData.email} onChange={(e) => { setFormData({...formData, email: e.target.value}); setErrors({...errors, email: null}); }} className={errors.email ? 'border-red-500' : ''} placeholder="vendor@email.com" />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Business address" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createVendor.isPending}>{createVendor.isPending ? 'Adding...' : 'Add Vendor'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Vendors ({filtered.length})</CardTitle>
            <div className="relative w-72"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search vendors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="text-center py-8">Loading...</div> : filtered.length === 0 ? (
            <div className="text-center py-12"><Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No vendors found</p></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Company</TableHead><TableHead>Service</TableHead><TableHead>Contact</TableHead><TableHead>Mobile</TableHead><TableHead>Email</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.companyName}</TableCell>
                    <TableCell className="capitalize">{(v.serviceType || '').replace('_', ' ')}</TableCell>
                    <TableCell>{v.contactPerson}</TableCell>
                    <TableCell>{v.mobile}</TableCell>
                    <TableCell className="text-sm">{v.email}</TableCell>
                    <TableCell><Badge variant={v.status === 'active' ? 'default' : 'secondary'}>{v.status || 'active'}</Badge></TableCell>
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
