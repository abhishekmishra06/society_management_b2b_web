'use client';
import { useState } from 'react';
import { Package, Plus, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { useAssets, useCreateAsset } from '@/lib/api/queries';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function AssetsPage() {
  const queryClient = useQueryClient();
  const { data: assets, isLoading } = useAssets();
  const createAsset = useCreateAsset();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '', category: 'Furniture', value: '', condition: 'good', location: '', serialNumber: '', description: ''
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Asset name is required';
    if (!formData.value || isNaN(formData.value)) newErrors.value = 'Valid value is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    try {
      await createAsset.mutateAsync({ ...formData, value: Number(formData.value) });
      toast.success('Asset added successfully!');
      setDialogOpen(false);
      setFormData({ name: '', category: 'Furniture', value: '', condition: 'good', location: '', serialNumber: '', description: '' });
      setErrors({});
    } catch (error) {
      toast.error('Failed to add asset');
    }
  };

  const filtered = (assets || []).filter(a => {
    const q = searchQuery.toLowerCase();
    return (a.name || '').toLowerCase().includes(q) || (a.category || '').toLowerCase().includes(q) || (a.location || '').toLowerCase().includes(q);
  });

  const totalValue = (assets || []).reduce((sum, a) => sum + (Number(a.value) || 0), 0);

  const conditionColor = (condition) => {
    switch (condition) {
      case 'good': case 'excellent': return COLORS.success;
      case 'fair': return COLORS.warning;
      case 'poor': case 'damaged': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Asset Management</h1>
          <p className="text-muted-foreground mt-1">Track society assets and purchases</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => queryClient.invalidateQueries()}><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: COLORS.primary }} className="text-white"><Plus className="h-4 w-4 mr-2" />Add Asset</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Add New Asset</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Asset Name *</Label>
                  <Input placeholder="e.g., Water Pump, Generator" value={formData.name} onChange={(e) => { setFormData({...formData, name: e.target.value}); setErrors({...errors, name: null}); }} className={errors.name ? 'border-red-500' : ''} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select className="w-full p-2 border rounded-md" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                      <option value="Furniture">Furniture</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Sports">Sports</option>
                      <option value="Safety">Safety</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <select className="w-full p-2 border rounded-md" value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})}>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                      <option value="damaged">Damaged</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Value (₹) *</Label>
                    <Input type="number" placeholder="e.g., 15000" value={formData.value} onChange={(e) => { setFormData({...formData, value: e.target.value}); setErrors({...errors, value: null}); }} className={errors.value ? 'border-red-500' : ''} />
                    {errors.value && <p className="text-xs text-red-500">{errors.value}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Location *</Label>
                    <Input placeholder="e.g., Lobby, Gym" value={formData.location} onChange={(e) => { setFormData({...formData, location: e.target.value}); setErrors({...errors, location: null}); }} className={errors.location ? 'border-red-500' : ''} />
                    {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Serial Number</Label>
                  <Input placeholder="Optional serial/tag number" value={formData.serialNumber} onChange={(e) => setFormData({...formData, serialNumber: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="Additional notes" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createAsset.isPending} style={{ backgroundColor: COLORS.primary }} className="text-white">{createAsset.isPending ? 'Adding...' : 'Add Asset'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">Total Assets</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{(assets || []).length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Total Value</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.primary }}>₹{totalValue.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Good Condition</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.success }}>{(assets || []).filter(a => a.condition === 'good' || a.condition === 'excellent').length}</p></CardContent></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search assets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assets ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No assets recorded yet</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Add Asset" to record your first asset</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell><Badge variant="outline">{asset.category}</Badge></TableCell>
                    <TableCell>{asset.purchasedAt ? new Date(asset.purchasedAt).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>₹{Number(asset.value || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="capitalize font-medium" style={{ color: conditionColor(asset.condition) }}>{asset.condition}</span>
                    </TableCell>
                    <TableCell>{asset.location}</TableCell>
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
