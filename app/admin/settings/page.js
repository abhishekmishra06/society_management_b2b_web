'use client';
import { useState, useEffect } from 'react';
import { Settings, Save, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const BRAND = '#694cd0';

export default function AdminSettingsPage() {
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      const data = JSON.parse(stored);
      setUserData(data);
      setForm({ name: data.name || '', email: data.email || '', phone: data.phone || '' });
    }
  }, []);

  const handleSave = () => {
    const updated = { ...userData, ...form };
    localStorage.setItem('userData', JSON.stringify(updated));
    setUserData(updated);
    toast.success('Settings saved!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Super Admin profile and system settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" style={{ color: BRAND }} />Admin Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: BRAND }}>
              {(userData?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-lg">{userData?.name || 'Admin'}</p>
              <p className="text-sm text-gray-500">{userData?.role || 'SUPER_ADMIN'}</p>
              <p className="text-xs text-gray-400 font-mono">{userData?.userId}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} style={{ backgroundColor: BRAND }} className="text-white">
              <Save className="h-4 w-4 mr-2" />Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>System Info</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Platform:</span> <span className="font-medium">MyTower Society Management</span></div>
            <div><span className="text-gray-500">Version:</span> <span className="font-medium">1.0.0</span></div>
            <div><span className="text-gray-500">Role:</span> <span className="font-medium">{userData?.role}</span></div>
            <div><span className="text-gray-500">Login ID:</span> <span className="font-mono">{userData?.userId}</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
