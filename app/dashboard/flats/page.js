'use client';
import { useState, useMemo } from 'react';
import { Plus, Building2, Edit, Search, Filter, Users, Home, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { COLORS, STATUS_COLORS } from '@/lib/constants/colors';
import { useTowers, useFlats, useCreateTower, useCreateFlat, useResidents } from '@/lib/api/queries';
import { toast } from 'sonner';
import { validateForm, VALIDATION_RULES } from '@/lib/validation';
import { exportCSV } from '@/lib/pdf-utils';

export default function FlatsPage() {
  const [towerDialogOpen, setTowerDialogOpen] = useState(false);
  const [flatDialogOpen, setFlatDialogOpen] = useState(false);
  const [towerFormData, setTowerFormData] = useState({ name: '', floors: '', description: '' });
  const [flatFormData, setFlatFormData] = useState({ flatNumber: '', towerId: '', floor: '', bhk: '2', area: '', occupancyStatus: 'vacant' });
  const [errors, setErrors] = useState({});

  // Filters
  const [towerSearch, setTowerSearch] = useState('');
  const [flatSearch, setFlatSearch] = useState('');
  const [filterTower, setFilterTower] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBHK, setFilterBHK] = useState('');

  const { data: towers, isLoading: towersLoading } = useTowers();
  const { data: flats, isLoading: flatsLoading } = useFlats();
  const { data: residents } = useResidents();
  const createTower = useCreateTower();
  const createFlat = useCreateFlat();

  // Get resident info for a flat
  const getResidentForFlat = (flatNumber) => {
    if (!residents) return null;
    return residents.find(r => r.flatNumber === flatNumber);
  };

  // Tower stats
  const getTowerStats = (towerId) => {
    const towerFlats = flats?.filter(f => f.towerId === towerId) || [];
    return {
      total: towerFlats.length,
      occupied: towerFlats.filter(f => f.occupancyStatus === 'occupied').length,
      vacant: towerFlats.filter(f => f.occupancyStatus === 'vacant').length,
    };
  };

  // Filtered towers
  const filteredTowers = useMemo(() => {
    return (towers || []).filter(t =>
      t.name?.toLowerCase().includes(towerSearch.toLowerCase())
    );
  }, [towers, towerSearch]);

  // Filtered flats
  const filteredFlats = useMemo(() => {
    return (flats || []).filter(f => {
      const matchSearch = (f.flatNumber || '').toLowerCase().includes(flatSearch.toLowerCase());
      const matchTower = !filterTower || f.towerId === filterTower;
      const matchStatus = !filterStatus || f.occupancyStatus === filterStatus;
      const matchBHK = !filterBHK || String(f.bhk) === filterBHK;
      return matchSearch && matchTower && matchStatus && matchBHK;
    });
  }, [flats, flatSearch, filterTower, filterStatus, filterBHK]);

  const handleTowerSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validateForm(towerFormData, {
      name: { required: true, minLength: 1, message: 'Tower name is required' },
      floors: { required: true, min: 1, message: 'Number of floors is required' },
    });
    if (!isValid) { setErrors(validationErrors); return; }
    try {
      await createTower.mutateAsync(towerFormData);
      toast.success('Tower added successfully!');
      setTowerDialogOpen(false);
      setTowerFormData({ name: '', floors: '', description: '' });
      setErrors({});
    } catch (error) {
      toast.error('Failed to add tower');
    }
  };

  const handleFlatSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validateForm(flatFormData, {
      flatNumber: VALIDATION_RULES.flatNumber,
      towerId: { required: true, message: 'Please select a tower' },
      floor: { required: true, min: 0, message: 'Floor is required' },
      bhk: { required: true, message: 'BHK is required' },
    });
    if (!isValid) { setErrors(validationErrors); return; }
    try {
      await createFlat.mutateAsync(flatFormData);
      toast.success('Flat added successfully!');
      setFlatDialogOpen(false);
      setFlatFormData({ flatNumber: '', towerId: '', floor: '', bhk: '2', area: '', occupancyStatus: 'vacant' });
      setErrors({});
    } catch (error) {
      toast.error('Failed to add flat');
    }
  };

  const handleExportFlats = () => {
    exportCSV(filteredFlats.map(f => ({
      ...f,
      towerName: towers?.find(t => t.id === f.towerId)?.name || 'N/A',
      resident: getResidentForFlat(f.flatNumber)?.name || 'Vacant',
      residentType: getResidentForFlat(f.flatNumber)?.type || '-',
    })), [
      { key: 'flatNumber', label: 'Flat No' },
      { key: 'towerName', label: 'Tower' },
      { key: 'floor', label: 'Floor' },
      { key: 'bhk', label: 'BHK' },
      { key: 'area', label: 'Area (sqft)' },
      { key: 'occupancyStatus', label: 'Status' },
      { key: 'resident', label: 'Resident' },
      { key: 'residentType', label: 'Type' },
    ], 'FlatsData');
    toast.success('Flats data exported to CSV!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Flats & Towers</h1>
          <p className="text-muted-foreground mt-1">Manage buildings and flats with resident details</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm">Total Towers</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.primary }}>{towers?.length || 0}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Total Flats</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{flats?.length || 0}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Occupied</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.success }}>{flats?.filter(f => f.occupancyStatus === 'occupied').length || 0}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Vacant</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.warning }}>{flats?.filter(f => f.occupancyStatus === 'vacant').length || 0}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="towers" className="w-full">
        <TabsList>
          <TabsTrigger value="towers"><Building2 className="h-4 w-4 mr-1" />Towers</TabsTrigger>
          <TabsTrigger value="flats"><Home className="h-4 w-4 mr-1" />All Flats</TabsTrigger>
        </TabsList>

        {/* ===== TOWERS TAB ===== */}
        <TabsContent value="towers" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search towers..." value={towerSearch} onChange={(e) => setTowerSearch(e.target.value)} className="pl-10" />
            </div>
            <Dialog open={towerDialogOpen} onOpenChange={setTowerDialogOpen}>
              <DialogTrigger asChild>
                <Button style={{ backgroundColor: COLORS.primary }} className="text-white">
                  <Plus className="h-4 w-4 mr-2" />Add Tower
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Tower</DialogTitle>
                  <DialogDescription>Add a new building/tower</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTowerSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tower Name *</Label>
                    <Input value={towerFormData.name} onChange={(e) => setTowerFormData({...towerFormData, name: e.target.value})} placeholder="Tower A" className={errors.name ? 'border-red-500' : ''} />
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Number of Floors *</Label>
                    <Input type="number" min="1" value={towerFormData.floors} onChange={(e) => setTowerFormData({...towerFormData, floors: e.target.value})} className={errors.floors ? 'border-red-500' : ''} />
                    {errors.floors && <p className="text-xs text-red-500">{errors.floors}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={towerFormData.description} onChange={(e) => setTowerFormData({...towerFormData, description: e.target.value})} />
                  </div>
                  <div className="flex justify-end"><Button type="submit" disabled={createTower.isPending}>{createTower.isPending ? 'Adding...' : 'Add Tower'}</Button></div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader><CardTitle>Tower List</CardTitle></CardHeader>
            <CardContent>
              {towersLoading ? (
                <div className="text-center py-8">Loading towers...</div>
              ) : filteredTowers.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No towers found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tower Name</TableHead>
                      <TableHead>Floors</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Total Flats</TableHead>
                      <TableHead>Occupied</TableHead>
                      <TableHead>Vacant</TableHead>
                      <TableHead>Occupancy Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTowers.map((tower) => {
                      const stats = getTowerStats(tower.id);
                      const occupancyRate = stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0;
                      return (
                        <TableRow key={tower.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.primary + '20' }}>
                                <Building2 className="h-4 w-4" style={{ color: COLORS.primary }} />
                              </div>
                              <span className="font-semibold">{tower.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{tower.floors}</TableCell>
                          <TableCell className="text-muted-foreground">{tower.description || '-'}</TableCell>
                          <TableCell><Badge variant="outline">{stats.total}</Badge></TableCell>
                          <TableCell><Badge style={{ backgroundColor: COLORS.success + '20', color: COLORS.success }}>{stats.occupied}</Badge></TableCell>
                          <TableCell><Badge style={{ backgroundColor: COLORS.warning + '20', color: COLORS.warning }}>{stats.vacant}</Badge></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${occupancyRate}%`, backgroundColor: COLORS.primary }} />
                              </div>
                              <span className="text-xs">{occupancyRate}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== FLATS TAB ===== */}
        <TabsContent value="flats" className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search flat number..." value={flatSearch} onChange={(e) => setFlatSearch(e.target.value)} className="pl-10" />
            </div>
            <select className="p-2 border rounded-md text-sm" value={filterTower} onChange={(e) => setFilterTower(e.target.value)}>
              <option value="">All Towers</option>
              {towers?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select className="p-2 border rounded-md text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="occupied">Occupied</option>
              <option value="vacant">Vacant</option>
            </select>
            <select className="p-2 border rounded-md text-sm" value={filterBHK} onChange={(e) => setFilterBHK(e.target.value)}>
              <option value="">All BHK</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
            </select>
            <Button variant="outline" size="sm" onClick={handleExportFlats}>
              <Download className="h-4 w-4 mr-1" />CSV
            </Button>
            <Dialog open={flatDialogOpen} onOpenChange={setFlatDialogOpen}>
              <DialogTrigger asChild>
                <Button style={{ backgroundColor: COLORS.primary }} className="text-white">
                  <Plus className="h-4 w-4 mr-2" />Add Flat
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Flat</DialogTitle>
                  <DialogDescription>Add a flat to a tower</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleFlatSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tower *</Label>
                      <select className={`w-full p-2 border rounded-md ${errors.towerId ? 'border-red-500' : ''}`} value={flatFormData.towerId} onChange={(e) => setFlatFormData({...flatFormData, towerId: e.target.value})} required>
                        <option value="">Select Tower</option>
                        {towers?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                      {errors.towerId && <p className="text-xs text-red-500">{errors.towerId}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Flat Number *</Label>
                      <Input value={flatFormData.flatNumber} onChange={(e) => setFlatFormData({...flatFormData, flatNumber: e.target.value})} className={errors.flatNumber ? 'border-red-500' : ''} placeholder="e.g., A-101" />
                      {errors.flatNumber && <p className="text-xs text-red-500">{errors.flatNumber}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Floor *</Label>
                      <Input type="number" min="0" value={flatFormData.floor} onChange={(e) => setFlatFormData({...flatFormData, floor: e.target.value})} className={errors.floor ? 'border-red-500' : ''} />
                      {errors.floor && <p className="text-xs text-red-500">{errors.floor}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>BHK *</Label>
                      <select className="w-full p-2 border rounded-md" value={flatFormData.bhk} onChange={(e) => setFlatFormData({...flatFormData, bhk: e.target.value})}>
                        <option value="1">1 BHK</option>
                        <option value="2">2 BHK</option>
                        <option value="3">3 BHK</option>
                        <option value="4">4 BHK</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Area (sq ft)</Label>
                      <Input type="number" value={flatFormData.area} onChange={(e) => setFlatFormData({...flatFormData, area: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex justify-end"><Button type="submit" disabled={createFlat.isPending}>{createFlat.isPending ? 'Adding...' : 'Add Flat'}</Button></div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Flats List ({filteredFlats.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {flatsLoading ? (
                <div className="text-center py-8">Loading flats...</div>
              ) : filteredFlats.length === 0 ? (
                <div className="text-center py-12">
                  <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No flats found matching filters</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Flat No</TableHead>
                      <TableHead>Tower</TableHead>
                      <TableHead>Floor</TableHead>
                      <TableHead>BHK</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Resident/Owner</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFlats.map((flat) => {
                      const resident = getResidentForFlat(flat.flatNumber);
                      const towerName = towers?.find(t => t.id === flat.towerId)?.name || 'N/A';
                      return (
                        <TableRow key={flat.id}>
                          <TableCell className="font-semibold">{flat.flatNumber}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" style={{ color: COLORS.primary }} />
                              {towerName}
                            </div>
                          </TableCell>
                          <TableCell>{flat.floor}</TableCell>
                          <TableCell>{flat.bhk} BHK</TableCell>
                          <TableCell>{flat.area ? `${flat.area} sqft` : '-'}</TableCell>
                          <TableCell>
                            <Badge
                              style={{
                                backgroundColor: flat.occupancyStatus === 'occupied' ? COLORS.success + '20' : COLORS.warning + '20',
                                color: flat.occupancyStatus === 'occupied' ? COLORS.success : COLORS.warning,
                              }}
                            >
                              {flat.occupancyStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {resident ? (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                <span className="font-medium">{resident.name}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Vacant</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {resident ? (
                              <Badge variant="outline" className="capitalize text-xs">
                                {resident.type || 'resident'}
                              </Badge>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-xs">
                            {resident ? (
                              <div>
                                <p>{resident.mobile || '-'}</p>
                                <p className="text-muted-foreground">{resident.email || ''}</p>
                              </div>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
