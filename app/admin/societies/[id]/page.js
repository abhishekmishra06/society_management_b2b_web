'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Building2, ArrowLeft, Plus, Edit, Trash2, Search, RefreshCw,
  Home, Users, BarChart3, MapPin, Phone, Mail, Calendar, Shield,
  Filter, X, ChevronDown, ChevronUp, Eye, Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';

const BRAND = '#694cd0';
const FLAT_TYPES = ['1RK', '1BHK', '2BHK', '3BHK', '4BHK', '5BHK', 'Penthouse', 'Shop', 'Office'];
const FLAT_STATUSES = ['vacant', 'occupied', 'rented', 'under_maintenance'];

export default function SocietyProfilePage() {
  const router = useRouter();
  const params = useParams();
  const societyId = params.id;

  const [activeTab, setActiveTab] = useState('overview');
  const [society, setSociety] = useState(null);
  const [towers, setTowers] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tower state
  const [towerDialogOpen, setTowerDialogOpen] = useState(false);
  const [towerEditMode, setTowerEditMode] = useState(false);
  const [selectedTower, setSelectedTower] = useState(null);
  const [towerForm, setTowerForm] = useState({ name: '', totalFloors: '', flatsPerFloor: '', description: '', status: 'active' });
  const [towerDeleteOpen, setTowerDeleteOpen] = useState(false);

  // Flat state
  const [flatDialogOpen, setFlatDialogOpen] = useState(false);
  const [flatEditMode, setFlatEditMode] = useState(false);
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [flatForm, setFlatForm] = useState({ towerId: '', towerName: '', flatNumber: '', floor: '', type: '2BHK', area: '', ownerName: '', ownerPhone: '', ownerEmail: '', status: 'vacant' });
  const [flatDeleteOpen, setFlatDeleteOpen] = useState(false);

  // Flat filters
  const [flatSearch, setFlatSearch] = useState('');
  const [flatFilterTower, setFlatFilterTower] = useState('all');
  const [flatFilterStatus, setFlatFilterStatus] = useState('all');
  const [flatFilterType, setFlatFilterType] = useState('all');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/admin/societies/${societyId}/profile`);
      setSociety(data);
      setTowers(data.towers || []);
      setFlats(data.flats || []);
    } catch (e) { console.error(e); toast.error('Failed to load society profile'); }
    finally { setLoading(false); }
  }, [societyId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Tower CRUD
  const resetTowerForm = () => { setTowerForm({ name: '', totalFloors: '', flatsPerFloor: '', description: '', status: 'active' }); };

  const handleAddTower = async (ev) => {
    ev.preventDefault();
    if (!towerForm.name.trim()) { toast.error('Tower name is required'); return; }
    try {
      await apiClient.post(`/admin/societies/${societyId}/towers`, {
        ...towerForm,
        totalFloors: Number(towerForm.totalFloors) || 0,
        flatsPerFloor: Number(towerForm.flatsPerFloor) || 0,
      });
      toast.success('Tower added!');
      setTowerDialogOpen(false); resetTowerForm(); fetchProfile();
    } catch (err) { toast.error('Failed to add tower'); }
  };

  const handleEditTower = (tower) => {
    setSelectedTower(tower);
    setTowerForm({
      name: tower.name || '', totalFloors: String(tower.totalFloors || ''),
      flatsPerFloor: String(tower.flatsPerFloor || ''), description: tower.description || '',
      status: tower.status || 'active'
    });
    setTowerEditMode(true); setTowerDialogOpen(true);
  };

  const handleUpdateTower = async (ev) => {
    ev.preventDefault();
    try {
      await apiClient.put(`/admin/societies/${societyId}/towers/${selectedTower.id}`, {
        ...towerForm,
        totalFloors: Number(towerForm.totalFloors) || 0,
        flatsPerFloor: Number(towerForm.flatsPerFloor) || 0,
      });
      toast.success('Tower updated!');
      setTowerDialogOpen(false); setTowerEditMode(false); resetTowerForm(); fetchProfile();
    } catch (err) { toast.error('Failed to update tower'); }
  };

  const handleDeleteTower = async () => {
    try {
      await apiClient.delete(`/admin/societies/${societyId}/towers/${selectedTower.id}`);
      toast.success('Tower deleted!');
      setTowerDeleteOpen(false); fetchProfile();
    } catch (err) { toast.error('Failed to delete tower'); }
  };

  // Flat CRUD
  const resetFlatForm = () => { setFlatForm({ towerId: '', towerName: '', flatNumber: '', floor: '', type: '2BHK', area: '', ownerName: '', ownerPhone: '', ownerEmail: '', status: 'vacant' }); };

  const handleAddFlat = async (ev) => {
    ev.preventDefault();
    if (!flatForm.flatNumber.trim()) { toast.error('Flat number is required'); return; }
    if (!flatForm.towerId) { toast.error('Please select a tower'); return; }
    const tower = towers.find(t => t.id === flatForm.towerId);
    try {
      await apiClient.post(`/admin/societies/${societyId}/flats`, {
        ...flatForm,
        towerName: tower?.name || '',
        floor: Number(flatForm.floor) || 0,
      });
      toast.success('Flat added!');
      setFlatDialogOpen(false); resetFlatForm(); fetchProfile();
    } catch (err) { toast.error('Failed to add flat'); }
  };

  const handleEditFlat = (flat) => {
    setSelectedFlat(flat);
    setFlatForm({
      towerId: flat.towerId || '', towerName: flat.towerName || '',
      flatNumber: flat.flatNumber || '', floor: String(flat.floor || ''),
      type: flat.type || '2BHK', area: flat.area || '',
      ownerName: flat.ownerName || '', ownerPhone: flat.ownerPhone || '',
      ownerEmail: flat.ownerEmail || '', status: flat.status || 'vacant'
    });
    setFlatEditMode(true); setFlatDialogOpen(true);
  };

  const handleUpdateFlat = async (ev) => {
    ev.preventDefault();
    const tower = towers.find(t => t.id === flatForm.towerId);
    try {
      await apiClient.put(`/admin/societies/${societyId}/flats/${selectedFlat.id}`, {
        ...flatForm,
        towerName: tower?.name || flatForm.towerName,
        floor: Number(flatForm.floor) || 0,
      });
      toast.success('Flat updated!');
      setFlatDialogOpen(false); setFlatEditMode(false); resetFlatForm(); fetchProfile();
    } catch (err) { toast.error('Failed to update flat'); }
  };

  const handleDeleteFlat = async () => {
    try {
      await apiClient.delete(`/admin/societies/${societyId}/flats/${selectedFlat.id}`);
      toast.success('Flat deleted!');
      setFlatDeleteOpen(false); fetchProfile();
    } catch (err) { toast.error('Failed to delete flat'); }
  };

  // Filtered flats
  const filteredFlats = flats.filter(f => {
    const q = flatSearch.toLowerCase();
    const matchSearch = !flatSearch || f.flatNumber?.toLowerCase().includes(q) || f.ownerName?.toLowerCase().includes(q) || f.towerName?.toLowerCase().includes(q);
    const matchTower = flatFilterTower === 'all' || f.towerId === flatFilterTower;
    const matchStatus = flatFilterStatus === 'all' || f.status === flatFilterStatus;
    const matchType = flatFilterType === 'all' || f.type === flatFilterType;
    return matchSearch && matchTower && matchStatus && matchType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 rounded-full" style={{ borderTopColor: BRAND }} />
      </div>
    );
  }

  if (!society) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Society not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/societies')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Societies
        </Button>
      </div>
    );
  }

  const stats = society.stats || {};
  const tabs = [
    { key: 'overview', label: 'Overview', icon: Building2 },
    { key: 'towers', label: `Towers (${towers.length})`, icon: Layers },
    { key: 'flats', label: `Flats (${flats.length})`, icon: Home },
    { key: 'statistics', label: 'Statistics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/admin/societies')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{society.name}</h1>
              <Badge variant={society.status === 'active' ? 'default' : 'secondary'}
                className={society.status === 'active' ? 'bg-green-500' : ''}>{society.status}</Badge>
              <Badge variant="outline" className="capitalize">{society.societyType || 'residential'}</Badge>
            </div>
            {society.address && <p className="text-gray-500 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {society.address}{society.city ? `, ${society.city}` : ''}{society.state ? `, ${society.state}` : ''} {society.pincode}</p>}
            <div className="flex gap-4 mt-2 text-xs text-gray-400">
              {society.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {society.phone}</span>}
              {society.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {society.email}</span>}
              {society.registrationNo && <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> {society.registrationNo}</span>}
            </div>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={fetchProfile}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Towers', value: stats.totalTowers || 0, color: BRAND },
          { label: 'Total Flats', value: stats.totalFlats || 0, color: '#3b82f6' },
          { label: 'Occupied', value: stats.occupiedFlats || 0, color: '#10b981' },
          { label: 'Vacant', value: stats.vacantFlats || 0, color: '#f59e0b' },
          { label: 'Occupancy', value: `${stats.occupancyRate || 0}%`, color: '#ef4444' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-3 pb-3 text-center">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition ${
                activeTab === tab.key ? 'border-current font-medium' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
              style={activeTab === tab.key ? { color: BRAND } : {}}
            >
              <Icon className="h-4 w-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Society Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-500">Name:</span><p className="font-medium">{society.name}</p></div>
                <div><span className="text-gray-500">Type:</span><p className="font-medium capitalize">{society.societyType || 'Residential'}</p></div>
                <div><span className="text-gray-500">Registration No:</span><p className="font-medium font-mono">{society.registrationNo || '-'}</p></div>
                <div><span className="text-gray-500">Established:</span><p className="font-medium">{society.establishedYear || '-'}</p></div>
                <div><span className="text-gray-500">Builder:</span><p className="font-medium">{society.builderName || '-'}</p></div>
                <div><span className="text-gray-500">Billing:</span><p className="font-medium capitalize">{society.billingPeriod || 'Monthly'}</p></div>
                <div><span className="text-gray-500">Maintenance:</span><p className="font-medium">{society.maintenanceAmount ? `₹${society.maintenanceAmount}` : '-'}</p></div>
                <div><span className="text-gray-500">Status:</span><p className="font-medium capitalize">{society.status}</p></div>
              </div>
              {society.description && <div><span className="text-gray-500">Description:</span><p className="mt-1">{society.description}</p></div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Contact & Location</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-500">Address:</span><p className="font-medium">{society.address || '-'}</p></div>
                <div><span className="text-gray-500">City:</span><p className="font-medium">{society.city || '-'}</p></div>
                <div><span className="text-gray-500">State:</span><p className="font-medium">{society.state || '-'}</p></div>
                <div><span className="text-gray-500">Pincode:</span><p className="font-medium">{society.pincode || '-'}</p></div>
                <div><span className="text-gray-500">Phone:</span><p className="font-medium">{society.phone || '-'}</p></div>
                <div><span className="text-gray-500">Email:</span><p className="font-medium">{society.email || '-'}</p></div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          {(society.amenities || []).length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-base">Amenities</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {society.amenities.map(a => (
                    <Badge key={a} variant="outline" className="text-sm py-1 px-3">{a}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tower Summary */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Tower Summary</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setActiveTab('towers')}>
                View All <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {towers.length === 0 ? (
                <p className="text-center text-gray-400 py-4">No towers added yet</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {towers.map(t => (
                    <div key={t.id} className="p-3 rounded-lg border bg-gray-50">
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.totalFloors || 0} floors</p>
                      <div className="flex gap-2 mt-1 text-xs">
                        <span className="text-green-600">{t.occupiedCount || 0} occupied</span>
                        <span className="text-gray-400">|</span>
                        <span>{t.flatCount || 0} flats</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'towers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tower Management</h3>
            <Button onClick={() => { resetTowerForm(); setTowerEditMode(false); setTowerDialogOpen(true); }}
              style={{ backgroundColor: BRAND }} className="text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Tower
            </Button>
          </div>

          {towers.length === 0 ? (
            <Card><CardContent className="text-center py-12">
              <Layers className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-400">No towers yet. Add a tower to get started.</p>
            </CardContent></Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {towers.map(tower => (
                <Card key={tower.id} className="hover:shadow-md transition">
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: BRAND + '15' }}>
                          <Building2 className="h-6 w-6" style={{ color: BRAND }} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{tower.name}</h4>
                          <Badge variant={tower.status === 'active' ? 'default' : 'secondary'} className="text-xs mt-1">{tower.status}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEditTower(tower)}><Edit className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => { setSelectedTower(tower); setTowerDeleteOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded bg-gray-50">
                        <p className="text-lg font-bold" style={{ color: BRAND }}>{tower.totalFloors || 0}</p>
                        <p className="text-xs text-gray-500">Floors</p>
                      </div>
                      <div className="p-2 rounded bg-gray-50">
                        <p className="text-lg font-bold text-blue-600">{tower.flatCount || 0}</p>
                        <p className="text-xs text-gray-500">Flats</p>
                      </div>
                      <div className="p-2 rounded bg-gray-50">
                        <p className="text-lg font-bold text-green-600">{tower.occupiedCount || 0}</p>
                        <p className="text-xs text-gray-500">Occupied</p>
                      </div>
                    </div>
                    {tower.description && <p className="text-xs text-gray-400 mt-3">{tower.description}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Tower Dialog */}
          <Dialog open={towerDialogOpen} onOpenChange={o => { setTowerDialogOpen(o); if (!o) { resetTowerForm(); setTowerEditMode(false); } }}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>{towerEditMode ? `Edit Tower: ${selectedTower?.name}` : 'Add New Tower'}</DialogTitle></DialogHeader>
              <form onSubmit={towerEditMode ? handleUpdateTower : handleAddTower} className="space-y-4">
                <div className="space-y-2">
                  <Label>Tower Name *</Label>
                  <Input value={towerForm.name} onChange={e => setTowerForm({...towerForm, name: e.target.value})} placeholder="e.g., Tower A" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Total Floors</Label>
                    <Input type="number" value={towerForm.totalFloors} onChange={e => setTowerForm({...towerForm, totalFloors: e.target.value})} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Flats per Floor</Label>
                    <Input type="number" value={towerForm.flatsPerFloor} onChange={e => setTowerForm({...towerForm, flatsPerFloor: e.target.value})} placeholder="0" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={towerForm.description} onChange={e => setTowerForm({...towerForm, description: e.target.value})} placeholder="Optional description" />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select className="w-full p-2 border rounded-md text-sm" value={towerForm.status} onChange={e => setTowerForm({...towerForm, status: e.target.value})}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="under_construction">Under Construction</option>
                  </select>
                </div>
                {!towerEditMode && Number(towerForm.totalFloors) > 0 && Number(towerForm.flatsPerFloor) > 0 && (
                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    This will auto-generate {Number(towerForm.totalFloors) * Number(towerForm.flatsPerFloor)} flats
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setTowerDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" style={{ backgroundColor: BRAND }} className="text-white">
                    {towerEditMode ? 'Update Tower' : 'Add Tower'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Tower Delete */}
          <Dialog open={towerDeleteOpen} onOpenChange={setTowerDeleteOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Delete Tower</DialogTitle></DialogHeader>
              <p>Delete <strong>{selectedTower?.name}</strong>? All flats in this tower will also be deleted.</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setTowerDeleteOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteTower}>Delete</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {activeTab === 'flats' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h3 className="text-lg font-semibold">Flat Management</h3>
            <Button onClick={() => { resetFlatForm(); setFlatEditMode(false); setFlatDialogOpen(true); }}
              style={{ backgroundColor: BRAND }} className="text-white" disabled={towers.length === 0}>
              <Plus className="h-4 w-4 mr-2" /> Add Flat
            </Button>
          </div>

          {/* Flat Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search flats..." value={flatSearch} onChange={e => setFlatSearch(e.target.value)} className="pl-10" />
            </div>
            <select className="p-2 border rounded-md text-sm" value={flatFilterTower} onChange={e => setFlatFilterTower(e.target.value)}>
              <option value="all">All Towers</option>
              {towers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select className="p-2 border rounded-md text-sm" value={flatFilterStatus} onChange={e => setFlatFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              {FLAT_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
            <select className="p-2 border rounded-md text-sm" value={flatFilterType} onChange={e => setFlatFilterType(e.target.value)}>
              <option value="all">All Types</option>
              {FLAT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {towers.length === 0 ? (
            <Card><CardContent className="text-center py-12">
              <Home className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-400">Add towers first before managing flats</p>
            </CardContent></Card>
          ) : filteredFlats.length === 0 ? (
            <Card><CardContent className="text-center py-12">
              <Home className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-400">No flats found{flatSearch || flatFilterTower !== 'all' || flatFilterStatus !== 'all' ? ' matching filters' : ''}</p>
            </CardContent></Card>
          ) : (
            <Card>
              <CardHeader><CardTitle className="text-sm">Showing {filteredFlats.length} of {flats.length} flats</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Flat No.</TableHead>
                        <TableHead>Tower</TableHead>
                        <TableHead>Floor</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFlats.slice(0, 100).map(flat => (
                        <TableRow key={flat.id}>
                          <TableCell className="font-medium font-mono">{flat.flatNumber}</TableCell>
                          <TableCell className="text-xs">{flat.towerName || '-'}</TableCell>
                          <TableCell>{flat.floor || '-'}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{flat.type}</Badge></TableCell>
                          <TableCell className="text-xs">{flat.area || '-'}</TableCell>
                          <TableCell className="text-sm">{flat.ownerName || '-'}</TableCell>
                          <TableCell className="text-xs">{flat.ownerPhone || '-'}</TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${
                              flat.status === 'occupied' ? 'bg-green-500' :
                              flat.status === 'rented' ? 'bg-blue-500' :
                              flat.status === 'under_maintenance' ? 'bg-orange-500' : 'bg-gray-400'
                            }`}>
                              {(flat.status || 'vacant').replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => handleEditFlat(flat)}><Edit className="h-3 w-3" /></Button>
                              <Button size="sm" variant="outline" className="text-red-500" onClick={() => { setSelectedFlat(flat); setFlatDeleteOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredFlats.length > 100 && <p className="text-xs text-gray-400 mt-2 text-center">Showing first 100 of {filteredFlats.length} flats</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Flat Dialog */}
          <Dialog open={flatDialogOpen} onOpenChange={o => { setFlatDialogOpen(o); if (!o) { resetFlatForm(); setFlatEditMode(false); } }}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{flatEditMode ? `Edit Flat: ${selectedFlat?.flatNumber}` : 'Add New Flat'}</DialogTitle></DialogHeader>
              <form onSubmit={flatEditMode ? handleUpdateFlat : handleAddFlat} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Tower *</Label>
                    <select className="w-full p-2 border rounded-md text-sm" value={flatForm.towerId} onChange={e => setFlatForm({...flatForm, towerId: e.target.value})}>
                      <option value="">Select Tower</option>
                      {towers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Flat Number *</Label>
                    <Input value={flatForm.flatNumber} onChange={e => setFlatForm({...flatForm, flatNumber: e.target.value})} placeholder="e.g., 101" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Floor</Label>
                    <Input type="number" value={flatForm.floor} onChange={e => setFlatForm({...flatForm, floor: e.target.value})} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select className="w-full p-2 border rounded-md text-sm" value={flatForm.type} onChange={e => setFlatForm({...flatForm, type: e.target.value})}>
                      {FLAT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Area (sq.ft)</Label>
                    <Input value={flatForm.area} onChange={e => setFlatForm({...flatForm, area: e.target.value})} placeholder="e.g., 1200" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Owner Name</Label>
                  <Input value={flatForm.ownerName} onChange={e => setFlatForm({...flatForm, ownerName: e.target.value})} placeholder="Flat owner name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Owner Phone</Label>
                    <Input value={flatForm.ownerPhone} onChange={e => setFlatForm({...flatForm, ownerPhone: e.target.value})} placeholder="Phone" />
                  </div>
                  <div className="space-y-2">
                    <Label>Owner Email</Label>
                    <Input type="email" value={flatForm.ownerEmail} onChange={e => setFlatForm({...flatForm, ownerEmail: e.target.value})} placeholder="Email" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select className="w-full p-2 border rounded-md text-sm" value={flatForm.status} onChange={e => setFlatForm({...flatForm, status: e.target.value})}>
                    {FLAT_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setFlatDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" style={{ backgroundColor: BRAND }} className="text-white">
                    {flatEditMode ? 'Update Flat' : 'Add Flat'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Flat Delete */}
          <Dialog open={flatDeleteOpen} onOpenChange={setFlatDeleteOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Delete Flat</DialogTitle></DialogHeader>
              <p>Delete flat <strong>{selectedFlat?.flatNumber}</strong> from {selectedFlat?.towerName}?</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setFlatDeleteOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteFlat}>Delete</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {activeTab === 'statistics' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Occupancy Overview</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Occupancy Rate</span>
                    <span className="font-bold">{stats.occupancyRate || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="h-3 rounded-full transition-all" style={{ width: `${stats.occupancyRate || 0}%`, backgroundColor: BRAND }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-green-50 text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.occupiedFlats || 0}</p>
                    <p className="text-xs text-gray-500">Occupied Flats</p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-50 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{stats.vacantFlats || 0}</p>
                    <p className="text-xs text-gray-500">Vacant Flats</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Tower Breakdown</CardTitle></CardHeader>
            <CardContent>
              {towers.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No tower data</p>
              ) : (
                <div className="space-y-3">
                  {towers.map(t => (
                    <div key={t.id} className="flex items-center gap-3">
                      <div className="w-24 text-sm font-medium truncate">{t.name}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 relative overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: t.flatCount > 0 ? `${(t.occupiedCount / t.flatCount) * 100}%` : '0%',
                          backgroundColor: BRAND
                        }} />
                      </div>
                      <div className="text-xs text-gray-500 w-20 text-right">
                        {t.occupiedCount}/{t.flatCount} flats
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader><CardTitle className="text-base">Flat Type Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {FLAT_TYPES.map(type => {
                  const count = flats.filter(f => f.type === type).length;
                  if (count === 0) return null;
                  return (
                    <div key={type} className="p-3 rounded-lg border text-center">
                      <p className="text-xl font-bold" style={{ color: BRAND }}>{count}</p>
                      <p className="text-xs text-gray-500">{type}</p>
                    </div>
                  );
                })}
                {flats.length === 0 && <p className="text-gray-400 text-sm col-span-full text-center py-4">No flat data available</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
