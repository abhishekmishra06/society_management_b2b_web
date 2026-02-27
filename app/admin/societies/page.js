'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2, Plus, Search, RefreshCw, Edit, Trash2, Eye,
  MapPin, Phone, Mail, Filter, X, ChevronDown
} from 'lucide-react';
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
const SOCIETY_TYPES = ['residential', 'commercial', 'mixed'];
const AMENITIES_LIST = [
  'Swimming Pool', 'Gym', 'Clubhouse', 'Garden', 'Playground',
  'Parking', 'Security', 'CCTV', 'Intercom', 'Power Backup',
  'Water Supply', 'Lift', 'Fire Safety', 'Jogging Track', 'Indoor Games'
];

export default function SocietiesPage() {
  const router = useRouter();
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [form, setForm] = useState({
    name: '', address: '', city: '', state: '', pincode: '',
    phone: '', email: '', registrationNo: '', totalTowers: '', totalFlats: '',
    societyType: 'residential', description: '', establishedYear: '',
    builderName: '', amenities: [], billingPeriod: 'monthly', maintenanceAmount: '', status: 'active'
  });
  const [errors, setErrors] = useState({});

  const fetchSocieties = async () => {
    setLoading(true);
    try { const { data } = await apiClient.get('/admin/societies'); setSocieties(data); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSocieties(); }, []);

  const resetForm = () => {
    setForm({
      name: '', address: '', city: '', state: '', pincode: '',
      phone: '', email: '', registrationNo: '', totalTowers: '', totalFlats: '',
      societyType: 'residential', description: '', establishedYear: '',
      builderName: '', amenities: [], billingPeriod: 'monthly', maintenanceAmount: '', status: 'active'
    });
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Society name required';
    if (!form.city.trim()) e.city = 'City required';
    return e;
  };

  const toggleAmenity = (amenity) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter(a => a !== amenity)
        : [...f.amenities, amenity]
    }));
  };

  const handleAdd = async (ev) => {
    ev.preventDefault();
    const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
    try {
      await apiClient.post('/admin/societies', {
        ...form,
        totalTowers: Number(form.totalTowers) || 0,
        totalFlats: Number(form.totalFlats) || 0
      });
      toast.success('Society onboarded!'); setAddOpen(false); resetForm(); fetchSocieties();
    } catch (err) { toast.error('Failed to create society'); }
  };

  const handleEdit = (soc) => {
    setSelected(soc);
    setForm({
      name: soc.name || '', address: soc.address || '', city: soc.city || '',
      state: soc.state || '', pincode: soc.pincode || '', phone: soc.phone || '',
      email: soc.email || '', registrationNo: soc.registrationNo || '',
      totalTowers: String(soc.totalTowers || ''), totalFlats: String(soc.totalFlats || ''),
      societyType: soc.societyType || 'residential', description: soc.description || '',
      establishedYear: soc.establishedYear || '', builderName: soc.builderName || '',
      amenities: soc.amenities || [], billingPeriod: soc.billingPeriod || 'monthly',
      maintenanceAmount: soc.maintenanceAmount || '', status: soc.status || 'active'
    });
    setErrors({}); setEditOpen(true);
  };

  const handleUpdate = async (ev) => {
    ev.preventDefault();
    const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
    try {
      await apiClient.put(`/admin/societies/${selected.id}`, {
        ...form,
        totalTowers: Number(form.totalTowers) || 0,
        totalFlats: Number(form.totalFlats) || 0
      });
      toast.success('Society updated!'); setEditOpen(false); resetForm(); fetchSocieties();
    } catch (err) { toast.error('Failed to update'); }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/admin/societies/${selected.id}`);
      toast.success('Society deleted!'); setDeleteOpen(false); fetchSocieties();
    } catch (err) { toast.error('Failed to delete'); }
  };

  // Unique cities for filter
  const cities = [...new Set(societies.map(s => s.city).filter(Boolean))].sort();

  const filtered = societies.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !search || s.name?.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q) || s.registrationNo?.toLowerCase().includes(q) || s.builderName?.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchCity = filterCity === 'all' || s.city === filterCity;
    const matchType = filterType === 'all' || s.societyType === filterType;
    return matchSearch && matchStatus && matchCity && matchType;
  });

  const activeFilters = [filterStatus !== 'all', filterCity !== 'all', filterType !== 'all'].filter(Boolean).length;

  const clearFilters = () => { setFilterStatus('all'); setFilterCity('all'); setFilterType('all'); setSearch(''); };

  const SocietyForm = ({ onSubmit, label }) => (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Basic Info */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Building2 className="h-4 w-4" style={{ color: BRAND }} /> Basic Information
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Society Name *</Label>
            <Input value={form.name} onChange={e => { setForm({...form, name: e.target.value}); setErrors({...errors, name: null}); }} placeholder="e.g., Sunshine Heights" className={errors.name ? 'border-red-500' : ''} />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Society Type</Label>
            <select className="w-full p-2 border rounded-md text-sm" value={form.societyType} onChange={e => setForm({...form, societyType: e.target.value})}>
              {SOCIETY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <select className="w-full p-2 border rounded-md text-sm" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Description</Label>
            <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description" />
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4" style={{ color: BRAND }} /> Location
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Address</Label>
            <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Full address" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">City *</Label>
            <Input value={form.city} onChange={e => { setForm({...form, city: e.target.value}); setErrors({...errors, city: null}); }} placeholder="City" className={errors.city ? 'border-red-500' : ''} />
            {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">State</Label>
            <Input value={form.state} onChange={e => setForm({...form, state: e.target.value})} placeholder="State" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Pincode</Label>
            <Input value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} placeholder="PIN code" />
          </div>
        </div>
      </div>

      {/* Contact & Registration */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Phone className="h-4 w-4" style={{ color: BRAND }} /> Contact & Registration
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Phone</Label>
            <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Contact phone" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Email</Label>
            <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Contact email" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Registration No.</Label>
            <Input value={form.registrationNo} onChange={e => setForm({...form, registrationNo: e.target.value})} placeholder="Society registration #" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Established Year</Label>
            <Input value={form.establishedYear} onChange={e => setForm({...form, establishedYear: e.target.value})} placeholder="e.g., 2020" />
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Builder / Developer</Label>
            <Input value={form.builderName} onChange={e => setForm({...form, builderName: e.target.value})} placeholder="Builder or developer name" />
          </div>
        </div>
      </div>

      {/* Structure */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Structure & Billing</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Total Towers</Label>
            <Input type="number" value={form.totalTowers} onChange={e => setForm({...form, totalTowers: e.target.value})} placeholder="0" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Total Flats</Label>
            <Input type="number" value={form.totalFlats} onChange={e => setForm({...form, totalFlats: e.target.value})} placeholder="0" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Billing Period</Label>
            <select className="w-full p-2 border rounded-md text-sm" value={form.billingPeriod} onChange={e => setForm({...form, billingPeriod: e.target.value})}>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Maintenance Amount</Label>
            <Input value={form.maintenanceAmount} onChange={e => setForm({...form, maintenanceAmount: e.target.value})} placeholder="e.g., 5000" />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Amenities</h4>
        <div className="grid grid-cols-3 gap-2">
          {AMENITIES_LIST.map(a => (
            <button
              key={a} type="button" onClick={() => toggleAmenity(a)}
              className="flex items-center gap-2 p-2 rounded border text-xs text-left transition"
              style={{
                borderColor: form.amenities.includes(a) ? BRAND : '#e5e7eb',
                backgroundColor: form.amenities.includes(a) ? BRAND + '10' : ''
              }}
            >
              <div className="h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0"
                style={{ borderColor: form.amenities.includes(a) ? BRAND : '#d1d5db', backgroundColor: form.amenities.includes(a) ? BRAND : '' }}>
                {form.amenities.includes(a) && <span className="text-white text-[8px]">✓</span>}
              </div>
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => { setAddOpen(false); setEditOpen(false); }}>Cancel</Button>
        <Button type="submit" style={{ backgroundColor: BRAND }} className="text-white">{label}</Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Society Management</h1>
          <p className="text-gray-500 mt-1">Onboard and manage societies across the platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchSocieties}><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild><Button style={{ backgroundColor: BRAND }} className="text-white"><Plus className="h-4 w-4 mr-2" />Onboard Society</Button></DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Onboard New Society</DialogTitle></DialogHeader>
              <SocietyForm onSubmit={handleAdd} label="Onboard Society" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search by name, city, registration, builder..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'text-white' : ''}
            style={showFilters ? { backgroundColor: BRAND } : {}}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters {activeFilters > 0 && <Badge className="ml-2 bg-white text-gray-900 text-xs">{activeFilters}</Badge>}
          </Button>
          {activeFilters > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500">
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        {showFilters && (
          <Card className="border-dashed">
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Status</Label>
                  <select className="w-full p-2 border rounded-md text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">City</Label>
                  <select className="w-full p-2 border rounded-md text-sm" value={filterCity} onChange={e => setFilterCity(e.target.value)}>
                    <option value="all">All Cities</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Type</Label>
                  <select className="w-full p-2 border rounded-md text-sm" value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="all">All Types</option>
                    {SOCIETY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-2xl font-bold" style={{ color: BRAND }}>{societies.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600">{societies.filter(s => s.status === 'active').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500">Inactive</p>
            <p className="text-2xl font-bold text-red-500">{societies.filter(s => s.status === 'inactive').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500">Cities</p>
            <p className="text-2xl font-bold text-blue-600">{cities.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Society Table */}
      <Card>
        <CardHeader><CardTitle>Societies ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-8">Loading...</div> : filtered.length === 0 ? (
            <div className="text-center py-12"><Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" /><p className="text-gray-400">No societies found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Society Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Reg. No.</TableHead>
                    <TableHead>Towers</TableHead>
                    <TableHead>Flats</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(soc => (
                    <TableRow key={soc.id} className="cursor-pointer hover:bg-gray-50" onClick={() => router.push(`/admin/societies/${soc.id}`)}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{soc.name}</p>
                          {soc.builderName && <p className="text-xs text-gray-400">{soc.builderName}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">{soc.societyType || 'residential'}</Badge>
                      </TableCell>
                      <TableCell>{soc.city || '-'}</TableCell>
                      <TableCell className="font-mono text-xs">{soc.registrationNo || '-'}</TableCell>
                      <TableCell>{soc.totalTowers || 0}</TableCell>
                      <TableCell>{soc.totalFlats || 0}</TableCell>
                      <TableCell>
                        <Badge variant={soc.status === 'active' ? 'default' : 'secondary'}
                          className={soc.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}>
                          {soc.status || 'active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          <Button size="sm" variant="outline" onClick={() => router.push(`/admin/societies/${soc.id}`)} title="View Profile">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(soc)}><Edit className="h-3 w-3" /></Button>
                          <Button size="sm" variant="outline" className="text-red-500" onClick={() => { setSelected(soc); setDeleteOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={o => { setEditOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Society: {selected?.name}</DialogTitle></DialogHeader>
          <SocietyForm onSubmit={handleUpdate} label="Update Society" />
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Society</DialogTitle></DialogHeader>
          <p>Are you sure you want to delete <strong>{selected?.name}</strong>? This will also delete all towers and flats associated with this society.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
