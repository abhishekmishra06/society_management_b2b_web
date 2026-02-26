'use client';
import { useState } from 'react';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { COLORS } from '@/lib/constants/colors';
import { PERMISSION_MODULES } from '@/lib/permissions';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';

export default function ShareAccessDialog({ open, onOpenChange, entityName, entityId, entityType, defaultRole }) {
  const [formData, setFormData] = useState({
    name: entityName || '',
    userId: '',
    password: '',
    email: '',
    phone: '',
  });
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const togglePermission = (key) => {
    setSelectedPermissions(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const selectAll = () => {
    setSelectedPermissions(Object.values(PERMISSION_MODULES).map(m => m.key));
  };

  const clearAll = () => {
    setSelectedPermissions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.userId.trim()) newErrors.userId = 'Login ID is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (formData.password.length < 4) newErrors.password = 'Password must be at least 4 characters';
    if (selectedPermissions.length === 0) newErrors.permissions = 'Select at least one permission';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      await apiClient.post('/users/share-access', {
        name: formData.name || entityName,
        userId: formData.userId,
        password: formData.password,
        email: formData.email,
        phone: formData.phone,
        role: defaultRole || 'STAFF',
        permissions: selectedPermissions,
        linkedEntityId: entityId,
        linkedEntityType: entityType,
      });
      toast.success(`Access created for ${formData.userId}! They can now login.`);
      onOpenChange(false);
      setFormData({ name: entityName || '', userId: '', password: '', email: '', phone: '' });
      setSelectedPermissions([]);
      setErrors({});
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create access';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" style={{ color: COLORS.primary }} />
            Share Access - {entityName || 'New User'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="text-muted-foreground">Create login credentials for <strong>{entityName}</strong>. They will be able to access features based on the permissions you grant.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label>Login ID *</Label>
              <Input value={formData.userId} onChange={(e) => { setFormData({...formData, userId: e.target.value}); setErrors({...errors, userId: null}); }} placeholder="e.g., staff_john" className={errors.userId ? 'border-red-500' : ''} />
              {errors.userId && <p className="text-xs text-red-500">{errors.userId}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Password *</Label>
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => { setFormData({...formData, password: e.target.value}); setErrors({...errors, password: null}); }} placeholder="Set a password" className={errors.password ? 'border-red-500 pr-10' : 'pr-10'} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="Phone number" />
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">Permissions *</Label>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={selectAll}>Select All</Button>
                <Button type="button" variant="ghost" size="sm" onClick={clearAll}>Clear</Button>
              </div>
            </div>
            {errors.permissions && <p className="text-xs text-red-500">{errors.permissions}</p>}
            <div className="grid grid-cols-2 gap-2">
              {Object.values(PERMISSION_MODULES).map(module => (
                <button
                  key={module.key}
                  type="button"
                  onClick={() => togglePermission(module.key)}
                  className="flex items-center gap-2 p-3 rounded-lg border text-left transition-colors text-sm"
                  style={{
                    borderColor: selectedPermissions.includes(module.key) ? COLORS.primary : '#e5e7eb',
                    backgroundColor: selectedPermissions.includes(module.key) ? COLORS.primary + '10' : 'transparent',
                  }}
                >
                  <div className="h-4 w-4 rounded border flex items-center justify-center" style={{ borderColor: selectedPermissions.includes(module.key) ? COLORS.primary : '#d1d5db', backgroundColor: selectedPermissions.includes(module.key) ? COLORS.primary : 'transparent' }}>
                    {selectedPermissions.includes(module.key) && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className={selectedPermissions.includes(module.key) ? 'font-medium' : ''}>{module.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} style={{ backgroundColor: COLORS.primary }} className="text-white">
              <KeyRound className="h-4 w-4 mr-1" />{loading ? 'Creating...' : 'Create Access'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
