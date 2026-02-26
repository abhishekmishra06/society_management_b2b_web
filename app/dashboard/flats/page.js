'use client';
import { useState } from 'react';
import { Plus, Building2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { COLORS, STATUS_COLORS } from '@/lib/constants/colors';
import { useTowers, useFlats, useCreateTower, useCreateFlat } from '@/lib/api/queries';
import { toast } from 'sonner';

export default function FlatsPage() {
  const [towerDialogOpen, setTowerDialogOpen] = useState(false);
  const [flatDialogOpen, setFlatDialogOpen] = useState(false);
  const [towerFormData, setTowerFormData] = useState({ name: '', floors: '', description: '' });
  const [flatFormData, setFlatFormData] = useState({
    flatNumber: '',
    towerId: '',
    floor: '',
    bhk: '2',
    area: '',
    occupancyStatus: 'vacant',
  });

  const { data: towers, isLoading: towersLoading } = useTowers();
  const { data: flats, isLoading: flatsLoading } = useFlats();
  const createTower = useCreateTower();
  const createFlat = useCreateFlat();

  const handleTowerSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTower.mutateAsync(towerFormData);
      toast.success('Tower added successfully!');
      setTowerDialogOpen(false);
      setTowerFormData({ name: '', floors: '', description: '' });
    } catch (error) {
      toast.error('Failed to add tower');
    }
  };

  const handleFlatSubmit = async (e) => {
    e.preventDefault();
    try {
      await createFlat.mutateAsync(flatFormData);
      toast.success('Flat added successfully!');
      setFlatDialogOpen(false);
      setFlatFormData({
        flatNumber: '',
        towerId: '',
        floor: '',
        bhk: '2',
        area: '',
        occupancyStatus: 'vacant',
      });
    } catch (error) {
      toast.error('Failed to add flat');
    }
  };

  const getTowerStats = (towerId) => {
    const towerFlats = flats?.filter(f => f.towerId === towerId) || [];
    return {
      total: towerFlats.length,
      occupied: towerFlats.filter(f => f.occupancyStatus === 'occupied').length,
      vacant: towerFlats.filter(f => f.occupancyStatus === 'vacant').length,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Flats & Towers</h1>
          <p className="text-muted-foreground mt-1">Manage buildings and flats in your society</p>
        </div>
      </div>

      <Tabs defaultValue="towers" className="w-full">
        <TabsList>
          <TabsTrigger value="towers">Towers</TabsTrigger>
          <TabsTrigger value="flats">All Flats</TabsTrigger>
        </TabsList>

        <TabsContent value="towers" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={towerDialogOpen} onOpenChange={setTowerDialogOpen}>
              <DialogTrigger asChild>
                <Button style={{ backgroundColor: COLORS.primary }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tower
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Tower</DialogTitle>
                  <DialogDescription>Add a new building/tower to the society</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTowerSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="towerName">Tower Name *</Label>
                    <Input
                      id="towerName"
                      value={towerFormData.name}
                      onChange={(e) => setTowerFormData({...towerFormData, name: e.target.value})}
                      placeholder="Tower A"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floors">Number of Floors *</Label>
                    <Input
                      id="floors"
                      type="number"
                      value={towerFormData.floors}
                      onChange={(e) => setTowerFormData({...towerFormData, floors: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={towerFormData.description}
                      onChange={(e) => setTowerFormData({...towerFormData, description: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={createTower.isPending}>
                      {createTower.isPending ? 'Adding...' : 'Add Tower'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {towersLoading ? (
              <div className="col-span-3 text-center py-8">Loading towers...</div>
            ) : towers?.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No towers yet</p>
                <Button
                  className="mt-4"
                  style={{ backgroundColor: COLORS.primary }}
                  onClick={() => setTowerDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Tower
                </Button>
              </div>
            ) : (
              towers?.map((tower) => {
                const stats = getTowerStats(tower.id);
                return (
                  <Card key={tower.id}>
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.primary + '20' }}>
                          <Building2 className="h-6 w-6" style={{ color: COLORS.primary }} />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{tower.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{tower.floors} Floors</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Flats</span>
                          <Badge>{stats.total}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Occupied</span>
                          <Badge style={{ backgroundColor: STATUS_COLORS.occupied + '20', color: STATUS_COLORS.occupied }}>
                            {stats.occupied}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Vacant</span>
                          <Badge style={{ backgroundColor: STATUS_COLORS.vacant + '20', color: STATUS_COLORS.vacant }}>
                            {stats.vacant}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="flats" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={flatDialogOpen} onOpenChange={setFlatDialogOpen}>
              <DialogTrigger asChild>
                <Button style={{ backgroundColor: COLORS.primary }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Flat
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
                      <select
                        className="w-full p-2 border rounded-md"
                        value={flatFormData.towerId}
                        onChange={(e) => setFlatFormData({...flatFormData, towerId: e.target.value})}
                        required
                      >
                        <option value="">Select Tower</option>
                        {towers?.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="flatNumber">Flat Number *</Label>
                      <Input
                        id="flatNumber"
                        value={flatFormData.flatNumber}
                        onChange={(e) => setFlatFormData({...flatFormData, flatNumber: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="floor">Floor *</Label>
                      <Input
                        id="floor"
                        type="number"
                        value={flatFormData.floor}
                        onChange={(e) => setFlatFormData({...flatFormData, floor: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bhk">BHK *</Label>
                      <Input
                        id="bhk"
                        value={flatFormData.bhk}
                        onChange={(e) => setFlatFormData({...flatFormData, bhk: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area">Area (sq ft)</Label>
                      <Input
                        id="area"
                        type="number"
                        value={flatFormData.area}
                        onChange={(e) => setFlatFormData({...flatFormData, area: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={createFlat.isPending}>
                      {createFlat.isPending ? 'Adding...' : 'Add Flat'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              {flatsLoading ? (
                <div className="text-center py-8">Loading flats...</div>
              ) : flats?.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No flats added yet</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {flats?.map((flat) => (
                    <div key={flat.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">Flat {flat.flatNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {towers?.find(t => t.id === flat.towerId)?.name || 'Unknown'}
                          </p>
                        </div>
                        <Badge
                          style={{
                            backgroundColor: flat.occupancyStatus === 'occupied' 
                              ? STATUS_COLORS.occupied + '20' 
                              : STATUS_COLORS.vacant + '20',
                            color: flat.occupancyStatus === 'occupied' 
                              ? STATUS_COLORS.occupied 
                              : STATUS_COLORS.vacant,
                          }}
                        >
                          {flat.occupancyStatus}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <p>Floor: {flat.floor}</p>
                        <p>BHK: {flat.bhk}</p>
                        {flat.area && <p>Area: {flat.area} sq ft</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
