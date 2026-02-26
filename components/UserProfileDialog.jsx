'use client';
import { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Key, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { COLORS } from '@/lib/constants/colors';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';

export default function UserProfileDialog({ open, onOpenChange }) {
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem('userData');
      if (stored) {
        const data = JSON.parse(stored);
        setUserData(data);
        setFormData({ name: data.name || '', email: data.email || '', phone: data.phone || '' });
      }
      const perms = localStorage.getItem('userPermissions');
      if (perms) {
        try { setPermissions(JSON.parse(perms)); } catch (e) {}
      }
    }
  }, [open]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiClient.put('/user/profile', formData);
      const updated = { ...userData, ...formData };
      setUserData(updated);
      localStorage.setItem('userData', JSON.stringify(updated));
      toast.success('Profile updated!');
      setEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const permissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" style={{ color: COLORS.primary }} />
            My Profile
          </DialogTitle>
        </DialogHeader>

        {userData && (
          <div className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: COLORS.primary }}>
                {(userData.name || userData.userId || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold">{userData.name || userData.userId}</h3>
                <Badge style={{ backgroundColor: COLORS.primary }} className="text-white">{userData.role || 'User'}</Badge>
              </div>
            </div>

            {/* Info */}
            {!editing ? (
              <div className="space-y-3 bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">User ID:</span>
                  <span className="text-sm font-mono font-medium">{userData.userId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="text-sm font-medium">{userData.email || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Phone:</span>
                  <span className="text-sm font-medium">{userData.phone || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Role:</span>
                  <span className="text-sm font-medium">{userData.role}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
            )}

            {/* Permissions */}
            {permissions.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Permissions</p>
                <div className="flex flex-wrap gap-1">
                  {permissions.includes('FULL_ACCESS') ? (
                    <Badge style={{ backgroundColor: COLORS.success }} className="text-white">Full Access</Badge>
                  ) : (
                    permissions.map(p => <Badge key={p} variant="outline" className="capitalize">{p}</Badge>)
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              {editing ? (
                <>
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={loading} style={{ backgroundColor: COLORS.primary }} className="text-white">
                    <Save className="h-4 w-4 mr-1" />{loading ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)} style={{ backgroundColor: COLORS.primary }} className="text-white">Edit Profile</Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
