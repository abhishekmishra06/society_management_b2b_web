'use client';
import { useState } from 'react';
import { Plus, Search, Car as CarIcon, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COLORS } from '@/lib/constants/colors';
import { useVehicles, useCreateVehicle, useTowers } from '@/lib/api/queries';
import { toast } from 'sonner';

export default function VehiclesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'car',
    model: '',
    color: '',
    residentName: '',
    flatNumber: '',
    tower: '',
    parkingSlot: '',
  });

  const { data: vehicles, isLoading } = useVehicles();
  const { data: towers } = useTowers();
  const createVehicle = useCreateVehicle();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createVehicle.mutateAsync(formData);
      toast.success('Vehicle registered successfully!');
      setDialogOpen(false);
      setFormData({
        vehicleNumber: '',
        vehicleType: 'car',
        model: '',
        color: '',
        residentName: '',
        flatNumber: '',
        tower: '',
        parkingSlot: '',
      });
    } catch (error) {
      toast.error('Failed to register vehicle');
    }
  };

  const filteredVehicles = vehicles?.filter(v => 
    v.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.residentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.flatNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Vehicle Management</h1>
          <p className="text-muted-foreground mt-1">Register and manage vehicles in your society</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: COLORS.primary }}>
              <Plus className="h-4 w-4 mr-2" />
              Register Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Register New Vehicle</DialogTitle>
              <DialogDescription>Add a new vehicle to the society registry</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                  <Input
                    id="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                    placeholder="MH01AB1234"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select value={formData.vehicleType} onValueChange={(value) => setFormData({...formData, vehicleType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="bike">Bike</SelectItem>
                      <SelectItem value="scooter">Scooter</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    placeholder="Honda City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    placeholder="White"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="residentName">Resident Name *</Label>
                  <Input
                    id="residentName"
                    value={formData.residentName}
                    onChange={(e) => setFormData({...formData, residentName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flatNumber">Flat Number *</Label>
                  <Input
                    id="flatNumber"
                    value={formData.flatNumber}
                    onChange={(e) => setFormData({...formData, flatNumber: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tower">Tower *</Label>
                  <Select value={formData.tower} onValueChange={(value) => setFormData({...formData, tower: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tower" />
                    </SelectTrigger>
                    <SelectContent>
                      {towers?.map((tower) => (
                        <SelectItem key={tower.id} value={tower.id}>
                          {tower.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parkingSlot">Parking Slot</Label>
                  <Input
                    id="parkingSlot"
                    value={formData.parkingSlot}
                    onChange={(e) => setFormData({...formData, parkingSlot: e.target.value})}
                    placeholder="A-101"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" disabled={createVehicle.isPending}>
                  {createVehicle.isPending ? 'Registering...' : 'Register Vehicle'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Registered Vehicles ({filteredVehicles.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading vehicles...</div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-12">
              <CarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No vehicles registered yet</p>
              <Button
                className="mt-4"
                style={{ backgroundColor: COLORS.primary }}
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Register First Vehicle
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Flat</TableHead>
                  <TableHead>Parking Slot</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium font-mono">{vehicle.vehicleNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{vehicle.vehicleType}</Badge>
                    </TableCell>
                    <TableCell>{vehicle.model || 'N/A'}</TableCell>
                    <TableCell>{vehicle.color || 'N/A'}</TableCell>
                    <TableCell>{vehicle.residentName}</TableCell>
                    <TableCell>{vehicle.flatNumber}</TableCell>
                    <TableCell>{vehicle.parkingSlot || 'Not assigned'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
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
