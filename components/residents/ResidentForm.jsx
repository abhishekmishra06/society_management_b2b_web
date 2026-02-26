'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useTowers, useFlats } from '@/lib/api/queries';

export default function ResidentForm({ onSubmit, initialData, isLoading }) {
  const { data: towers } = useTowers();
  const { data: flats } = useFlats();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    tower: '',
    flatNumber: '',
    type: 'resident',
    status: 'active',
    aadhaar: '',
    pan: '',
    occupation: '',
    emergencyContact: '',
    emergencyContactName: '',
    moveInDate: '',
    ...(initialData || {}),
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({ ...formData, ...initialData });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    
    if (!formData.mobile || !/^[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Valid 10-digit mobile number is required';
    }
    
    if (!formData.tower) {
      newErrors.tower = 'Tower is required';
    }
    
    if (!formData.flatNumber) {
      newErrors.flatNumber = 'Flat number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile Number *</Label>
          <Input
            id="mobile"
            value={formData.mobile}
            onChange={(e) => handleChange('mobile', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Resident Type</Label>
          <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="resident">Resident</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="tenant">Tenant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tower">Tower *</Label>
          <Select value={formData.tower} onValueChange={(value) => handleChange('tower', value)}>
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
          <Label htmlFor="flatNumber">Flat Number *</Label>
          <Input
            id="flatNumber"
            value={formData.flatNumber}
            onChange={(e) => handleChange('flatNumber', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="aadhaar">Aadhaar Number</Label>
          <Input
            id="aadhaar"
            value={formData.aadhaar}
            onChange={(e) => handleChange('aadhaar', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pan">PAN Number</Label>
          <Input
            id="pan"
            value={formData.pan}
            onChange={(e) => handleChange('pan', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            value={formData.occupation}
            onChange={(e) => handleChange('occupation', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="moveInDate">Move-in Date</Label>
          <Input
            id="moveInDate"
            type="date"
            value={formData.moveInDate}
            onChange={(e) => handleChange('moveInDate', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
          <Input
            id="emergencyContactName"
            value={formData.emergencyContactName}
            onChange={(e) => handleChange('emergencyContactName', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact Number</Label>
          <Input
            id="emergencyContact"
            value={formData.emergencyContact}
            onChange={(e) => handleChange('emergencyContact', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? 'Update Resident' : 'Add Resident'
          )}
        </Button>
      </div>
    </form>
  );
}
