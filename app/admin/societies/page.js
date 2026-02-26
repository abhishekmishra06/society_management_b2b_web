'use client';
import { useState, useEffect } from 'react';
import { Building2, Plus, Search, RefreshCw, Edit, Trash2, MapPin, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';

const BRAND = '#694cd0';

export default function SocietiesPage() {
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', address: '', city: '', state: '', pincode: '', phone: '', email: '', registrationNo: '', totalTowers: '', totalFlats: '' });
  const [errors, setErrors] = useState({});

  const fetchSocieties = async () => {
    setLoading(true);
    try { const { data } = await apiClient.get('/admin/societies'); setSocieties(data); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSocieties(); }, []);

  const resetForm = () => { setForm({ name: '', address: '', city: '', state: '', pincode: '', phone: '', email: '', registrationNo: '', totalTowers: '', totalFlats: '' }); setErrors({}); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Society name required';
    if (!form.city.trim()) e.city = 'City required';
    return e;
  };

  const handleAdd = async (ev) => {
    ev.preventDefault();
    const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
    try {
      await apiClient.post('/admin/societies', { ...form, totalTowers: Number(form.totalTowers) || 0, totalFlats: Number(form.totalFlats) || 0 });
      toast.success('Society onboarded!'); setAddOpen(false); resetForm(); fetchSocieties();
    } catch (err) { toast.error('Failed to create society'); }
  };

  const handleEdit = (soc) => {
    setSelected(soc);
    setForm({ name: soc.name || '', address: soc.address || '', city: soc.city || '', state: soc.state || '', pincode: soc.pincode || '', phone: soc.phone || '', email: soc.email || '', registrationNo: soc.registrationNo || '', totalTowers: String(soc.totalTowers || ''), totalFlats: String(soc.totalFlats || '') });
    setErrors({}); setEditOpen(true);
  };

  const handleUpdate = async (ev) => {
    ev.preventDefault();
    const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
    try {
      await apiClient.put(`/admin/societies/${selected.id}`, { ...form, totalTowers: Number(form.totalTowers) || 0, totalFlats: Number(form.totalFlats) || 0 });
      toast.success('Society updated!'); setEditOpen(false); resetForm(); fetchSocieties();
    } catch (err) { toast.error('Failed to update'); }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/admin/societies/${selected.id}`);
      toast.success('Society deleted!'); setDeleteOpen(false); fetchSocieties();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const filtered = societies.filter(s => {
    const q = search.toLowerCase();
    return !search || s.name?.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q) || s.registrationNo?.toLowerCase().includes(q);
  });

  const SocietyForm = ({ onSubmit, label }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label>Society Name *</Label>
          <Input value={form.name} onChange={e => { setForm({...form, name: e.target.value}); setErrors({...errors, name: null}); }} placeholder="e.g., Sunshine Heights" className={errors.name ? 'border-red-500' : ''} />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>
        <div className="col-span-2 space-y-2">
          <Label>Address</Label>
          <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Full address" />
        </div>
        <div className="space-y-2">
          <Label>City *</Label>
          <Input value={form.city} onChange={e => { setForm({...form, city: e.target.value}); setErrors({...errors, city: null}); }} placeholder="City" className={errors.city ? 'border-red-500' : ''} />
          {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Input value={form.state} onChange={e => setForm({...form, state: e.target.value})} placeholder="State" />
        </div>
        <div className="space-y-2">
          <Label>Pincode</Label>
          <Input value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} placeholder="PIN code" />
        </div>
        <div className="space-y-2">
          <Label>Registration No.</Label>
          <Input value={form.registrationNo} onChange={e => setForm({...form, registrationNo: e.target.value})} placeholder="Society registration #" />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Contact phone" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Contact email" />
        </div>
        <div className="space-y-2">
          <Label>Total Towers</Label>
          <Input type="number" value={form.totalTowers} onChange={e => setForm({...form, totalTowers: e.target.value})} placeholder="0" />
        </div>
        <div className="space-y-2">
          <Label>Total Flats</Label>
          <Input type="number" value={form.totalFlats} onChange={e => setForm({...form, totalFlats: e.target.value})} placeholder="0" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => { setAddOpen(false); setEditOpen(false); }}>Cancel</Button>
        <Button type="submit" style={{ backgroundColor: BRAND }} className="text-white">{label}</Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Society Management</h1>
          <p className="text-gray-500 mt-1">Onboard and manage societies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchSocieties}><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild><Button style={{ backgroundColor: BRAND }} className="text-white"><Plus className="h-4 w-4 mr-2" />Onboard Society</Button></DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Onboard New Society</DialogTitle></DialogHeader>
              <SocietyForm onSubmit={handleAdd} label="Onboard Society" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search by name, city, registration..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card>
        <CardHeader><CardTitle>All Societies ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-8">Loading...</div> : filtered.length === 0 ? (
            <div className="text-center py-12"><Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" /><p className="text-gray-400">No societies found</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Society Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Reg. No.</TableHead>
                  <TableHead>Towers</TableHead>
                  <TableHead>Flats</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(soc => (
                  <TableRow key={soc.id}>
                    <TableCell className="font-medium">{soc.name}</TableCell>
                    <TableCell>{soc.city || '-'}</TableCell>
                    <TableCell className="font-mono text-xs">{soc.registrationNo || '-'}</TableCell>
                    <TableCell>{soc.totalTowers || 0}</TableCell>
                    <TableCell>{soc.totalFlats || 0}</TableCell>
                    <TableCell className="text-xs">{soc.phone || '-'}</TableCell>
                    <TableCell><Badge variant={soc.status === 'active' ? 'default' : 'secondary'}>{soc.status || 'active'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(soc)}><Edit className="h-3 w-3" /></Button>
                        <Button size="sm" variant="outline" className="text-red-500" onClick={() => { setSelected(soc); setDeleteOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={o => { setEditOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Society: {selected?.name}</DialogTitle></DialogHeader>
          <SocietyForm onSubmit={handleUpdate} label="Update Society" />
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Society</DialogTitle></DialogHeader>
          <p>Are you sure you want to delete <strong>{selected?.name}</strong>? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
