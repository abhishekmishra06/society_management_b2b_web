'use client';
import { useState } from 'react';
import { FileSignature, Plus, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { useVendorContracts, useCreateVendorContract, useVendors } from '@/lib/api/queries';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function VendorContractsPage() {
  const queryClient = useQueryClient();
  const { data: contracts, isLoading } = useVendorContracts();
  const { data: vendors } = useVendors();
  const createContract = useCreateVendorContract();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    vendorName: '', vendorId: '', serviceType: '', startDate: '', expiryDate: '', amount: '', terms: ''
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.vendorName.trim()) newErrors.vendorName = 'Vendor name is required';
    if (!formData.serviceType.trim()) newErrors.serviceType = 'Service type is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!formData.amount || isNaN(formData.amount)) newErrors.amount = 'Valid amount is required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    try {
      await createContract.mutateAsync({ ...formData, amount: Number(formData.amount) });
      toast.success('Contract created successfully!');
      setDialogOpen(false);
      setFormData({ vendorName: '', vendorId: '', serviceType: '', startDate: '', expiryDate: '', amount: '', terms: '' });
      setErrors({});
    } catch (error) {
      toast.error('Failed to create contract');
    }
  };

  const filtered = (contracts || []).filter(c => {
    const q = searchQuery.toLowerCase();
    return (c.vendorName || '').toLowerCase().includes(q) || (c.serviceType || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Vendor Contracts</h1>
          <p className="text-muted-foreground mt-1">Contract management and renewals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => queryClient.invalidateQueries()}><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: COLORS.primary }} className="text-white"><Plus className="h-4 w-4 mr-2" />Add Contract</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create New Contract</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Vendor Name *</Label>
                  <select className="w-full p-2 border rounded-md" value={formData.vendorName} onChange={(e) => { const v = vendors?.find(v => v.companyName === e.target.value); setFormData({...formData, vendorName: e.target.value, vendorId: v?.id || ''}); setErrors({...errors, vendorName: null}); }}>
                    <option value="">Select vendor or type below</option>
                    {vendors?.map(v => <option key={v.id} value={v.companyName}>{v.companyName}</option>)}
                  </select>
                  <Input placeholder="Or type vendor name" value={formData.vendorName} onChange={(e) => { setFormData({...formData, vendorName: e.target.value}); setErrors({...errors, vendorName: null}); }} className={errors.vendorName ? 'border-red-500' : ''} />
                  {errors.vendorName && <p className="text-xs text-red-500">{errors.vendorName}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Service Type *</Label>
                  <Input placeholder="e.g., Housekeeping, Security" value={formData.serviceType} onChange={(e) => { setFormData({...formData, serviceType: e.target.value}); setErrors({...errors, serviceType: null}); }} className={errors.serviceType ? 'border-red-500' : ''} />
                  {errors.serviceType && <p className="text-xs text-red-500">{errors.serviceType}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input type="date" value={formData.startDate} onChange={(e) => { setFormData({...formData, startDate: e.target.value}); setErrors({...errors, startDate: null}); }} className={errors.startDate ? 'border-red-500' : ''} />
                    {errors.startDate && <p className="text-xs text-red-500">{errors.startDate}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date *</Label>
                    <Input type="date" value={formData.expiryDate} onChange={(e) => { setFormData({...formData, expiryDate: e.target.value}); setErrors({...errors, expiryDate: null}); }} className={errors.expiryDate ? 'border-red-500' : ''} />
                    {errors.expiryDate && <p className="text-xs text-red-500">{errors.expiryDate}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Contract Amount (₹) *</Label>
                  <Input type="number" placeholder="e.g., 50000" value={formData.amount} onChange={(e) => { setFormData({...formData, amount: e.target.value}); setErrors({...errors, amount: null}); }} className={errors.amount ? 'border-red-500' : ''} />
                  {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Terms & Conditions</Label>
                  <Input placeholder="Contract terms" value={formData.terms} onChange={(e) => setFormData({...formData, terms: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createContract.isPending} style={{ backgroundColor: COLORS.primary }} className="text-white">{createContract.isPending ? 'Creating...' : 'Create Contract'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search contracts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contracts ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileSignature className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No contracts yet</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Add Contract" to create your first contract</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.vendorName}</TableCell>
                    <TableCell>{contract.serviceType}</TableCell>
                    <TableCell>{contract.startDate ? new Date(contract.startDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{contract.expiryDate ? new Date(contract.expiryDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>₹{Number(contract.amount || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                        {contract.status || 'active'}
                      </Badge>
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
