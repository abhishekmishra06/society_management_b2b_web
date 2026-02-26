'use client';
import { useState, useEffect } from 'react';
import { Users, Plus, Search, RefreshCw, Edit, Trash2, KeyRound, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';
import { PERMISSION_MODULES } from '@/lib/permissions';

const BRAND = '#694cd0';
const ROLES = ['SUPER_ADMIN', 'SOCIETY_ADMIN', 'STAFF', 'VENDOR', 'RESIDENT'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [form, setForm] = useState({ name: '', userId: '', password: '', email: '', phone: '', role: 'SOCIETY_ADMIN', societyId: '', permissions: [] });
  const [errors, setErrors] = useState({});

  const fetch = async () => {
    setLoading(true);
    try {
      const [uRes, sRes] = await Promise.all([apiClient.get('/admin/users'), apiClient.get('/admin/societies')]);
      setUsers(uRes.data); setSocieties(sRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const resetForm = () => { setForm({ name: '', userId: '', password: '', email: '', phone: '', role: 'SOCIETY_ADMIN', societyId: '', permissions: [] }); setErrors({}); };

  const togglePerm = (key) => setForm(f => ({ ...f, permissions: f.permissions.includes(key) ? f.permissions.filter(k => k !== key) : [...f.permissions, key] }));

  const handleAdd = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!form.userId.trim()) e.userId = 'Login ID required';
    if (!form.password.trim()) e.password = 'Password required';
    if (!form.name.trim()) e.name = 'Name required';
    if (Object.keys(e).length) { setErrors(e); return; }
    try {
      const perms = form.role === 'SUPER_ADMIN' ? ['FULL_ACCESS'] : form.permissions.length ? form.permissions : ['FULL_ACCESS'];
      await apiClient.post('/admin/users', { ...form, permissions: perms });
      toast.success('User created!'); setAddOpen(false); resetForm(); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create user'); }
  };

  const handleEditOpen = (u) => {
    setSelected(u);
    setForm({ name: u.name || '', userId: u.userId || '', password: '', email: u.email || '', phone: u.phone || '', role: u.role || 'STAFF', societyId: u.societyId || '', permissions: u.permissions || [] });
    setErrors({}); setEditOpen(true);
  };

  const handleUpdate = async (ev) => {
    ev.preventDefault();
    try {
      const updateData = { name: form.name, email: form.email, phone: form.phone, role: form.role, societyId: form.societyId, permissions: form.role === 'SUPER_ADMIN' ? ['FULL_ACCESS'] : form.permissions };
      if (form.password) updateData.password = form.password;
      await apiClient.put(`/admin/users/${selected.id}`, updateData);
      toast.success('User updated!'); setEditOpen(false); resetForm(); fetch();
    } catch (err) { toast.error('Failed to update user'); }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/admin/users/${selected.id}`);
      toast.success('User deleted!'); setDeleteOpen(false); fetch();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !search || u.name?.toLowerCase().includes(q) || u.userId?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const getSocietyName = (id) => societies.find(s => s.id === id)?.name || '-';

  const UserForm = ({ onSubmit, label, isEdit }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name *</Label>
          <Input value={form.name} onChange={e => { setForm({...form, name: e.target.value}); setErrors({...errors, name: null}); }} className={errors.name ? 'border-red-500' : ''} />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label>Login ID *</Label>
          <Input value={form.userId} onChange={e => { setForm({...form, userId: e.target.value}); setErrors({...errors, userId: null}); }} disabled={isEdit} className={errors.userId ? 'border-red-500' : ''} />
          {errors.userId && <p className="text-xs text-red-500">{errors.userId}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</Label>
          <Input type="password" value={form.password} onChange={e => { setForm({...form, password: e.target.value}); setErrors({...errors, password: null}); }} className={errors.password ? 'border-red-500' : ''} />
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <select className="w-full p-2 border rounded-md" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Assign to Society</Label>
        <select className="w-full p-2 border rounded-md" value={form.societyId} onChange={e => setForm({...form, societyId: e.target.value})}>
          <option value="">-- No Society --</option>
          {societies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {form.role !== 'SUPER_ADMIN' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Permissions</Label>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setForm({...form, permissions: Object.values(PERMISSION_MODULES).map(m => m.key)})}>All</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setForm({...form, permissions: []})}>None</Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(PERMISSION_MODULES).map(m => (
              <button key={m.key} type="button" onClick={() => togglePerm(m.key)} className="flex items-center gap-2 p-2 rounded border text-xs text-left transition" style={{ borderColor: form.permissions.includes(m.key) ? BRAND : '#e5e7eb', backgroundColor: form.permissions.includes(m.key) ? BRAND + '10' : '' }}>
                <div className="h-3.5 w-3.5 rounded border flex items-center justify-center" style={{ borderColor: form.permissions.includes(m.key) ? BRAND : '#d1d5db', backgroundColor: form.permissions.includes(m.key) ? BRAND : '' }}>
                  {form.permissions.includes(m.key) && <span className="text-white text-[8px]">✓</span>}
                </div>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage all users across societies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetch}><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild><Button style={{ backgroundColor: BRAND }} className="text-white"><Plus className="h-4 w-4 mr-2" />Add User</Button></DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
              <UserForm onSubmit={handleAdd} label="Create User" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select className="p-2 border rounded-md text-sm" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="all">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
        </select>
      </div>

      <Card>
        <CardHeader><CardTitle>All Users ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-8">Loading...</div> : filtered.length === 0 ? (
            <div className="text-center py-12"><Users className="h-12 w-12 mx-auto text-gray-300 mb-4" /><p className="text-gray-400">No users found</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Login ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Society</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name || u.userId}</TableCell>
                    <TableCell className="font-mono text-xs">{u.userId}</TableCell>
                    <TableCell><Badge style={u.role === 'SUPER_ADMIN' ? { backgroundColor: BRAND, color: '#fff' } : {}} variant={u.role === 'SUPER_ADMIN' ? 'default' : 'outline'}>{u.role}</Badge></TableCell>
                    <TableCell className="text-xs">{u.email || '-'}</TableCell>
                    <TableCell className="text-xs">{getSocietyName(u.societyId)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(u.permissions || []).includes('FULL_ACCESS') ? (
                          <Badge className="text-xs" style={{ backgroundColor: '#10b981', color: '#fff' }}>Full Access</Badge>
                        ) : (u.permissions || []).slice(0, 3).map(p => <Badge key={p} variant="outline" className="text-[10px] capitalize">{p}</Badge>)}
                        {(u.permissions || []).length > 3 && <Badge variant="outline" className="text-[10px]">+{u.permissions.length - 3}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEditOpen(u)}><Edit className="h-3 w-3" /></Button>
                        <Button size="sm" variant="outline" className="text-red-500" onClick={() => { setSelected(u); setDeleteOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={o => { setEditOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit User: {selected?.name}</DialogTitle></DialogHeader>
          <UserForm onSubmit={handleUpdate} label="Update User" isEdit />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
          <p>Delete <strong>{selected?.name || selected?.userId}</strong>? They will lose all access.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
