'use client';
import { useState, useEffect } from 'react';
import { UsersRound, Plus, Search, RefreshCw, Edit, Trash2, UserPlus, Filter, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';
import { PERMISSION_MODULES } from '@/lib/permissions';

const BRAND = '#694cd0';

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterSociety, setFilterSociety] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', societyId: '', permissions: [] });
  const [memberUserId, setMemberUserId] = useState('');
  const [errors, setErrors] = useState({});

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tRes, uRes, sRes] = await Promise.all([apiClient.get('/admin/teams'), apiClient.get('/admin/users'), apiClient.get('/admin/societies')]);
      setTeams(tRes.data); setUsers(uRes.data); setSocieties(sRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const resetForm = () => { setForm({ name: '', description: '', societyId: '', permissions: [] }); setErrors({}); };
  const togglePerm = (key) => setForm(f => ({ ...f, permissions: f.permissions.includes(key) ? f.permissions.filter(k => k !== key) : [...f.permissions, key] }));

  const handleAdd = async (ev) => {
    ev.preventDefault();
    if (!form.name.trim()) { setErrors({ name: 'Team name required' }); return; }
    try {
      await apiClient.post('/admin/teams', form);
      toast.success('Team created!'); setAddOpen(false); resetForm(); fetchAll();
    } catch (err) { toast.error('Failed to create team'); }
  };

  const handleEditOpen = (t) => {
    setSelected(t);
    setForm({ name: t.name || '', description: t.description || '', societyId: t.societyId || '', permissions: t.permissions || [] });
    setErrors({}); setEditOpen(true);
  };

  const handleUpdate = async (ev) => {
    ev.preventDefault();
    try {
      await apiClient.put(`/admin/teams/${selected.id}`, form);
      toast.success('Team updated!'); setEditOpen(false); resetForm(); fetchAll();
    } catch (err) { toast.error('Failed to update team'); }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/admin/teams/${selected.id}`);
      toast.success('Team deleted!'); setDeleteOpen(false); fetchAll();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const handleAddMember = async () => {
    if (!memberUserId) { toast.error('Select a user'); return; }
    try {
      await apiClient.post(`/admin/teams/${selected.id}/members`, { userId: memberUserId });
      toast.success('Member added!'); setMemberOpen(false); setMemberUserId(''); fetchAll();
    } catch (err) { toast.error('Failed to add member'); }
  };

  const filtered = teams.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search || t.name?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
    const matchSociety = filterSociety === 'all' || t.societyId === filterSociety;
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchSociety && matchStatus;
  });

  const activeFilters = [filterSociety !== 'all', filterStatus !== 'all'].filter(Boolean).length;
  const clearFilters = () => { setFilterSociety('all'); setFilterStatus('all'); setSearch(''); };

  const getUserName = (id) => users.find(u => u.id === id)?.name || id;
  const getSocietyName = (id) => societies.find(s => s.id === id)?.name || '-';

  const TeamForm = ({ onSubmit, label }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Team Name *</Label>
        <Input value={form.name} onChange={e => { setForm({...form, name: e.target.value}); setErrors({}); }} placeholder="e.g., Security Team" className={errors.name ? 'border-red-500' : ''} />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Team description" />
      </div>
      <div className="space-y-2">
        <Label>Society</Label>
        <select className="w-full p-2 border rounded-md" value={form.societyId} onChange={e => setForm({...form, societyId: e.target.value})}>
          <option value="">-- All Societies --</option>
          {societies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Team Permissions</Label>
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
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-500 mt-1">Create teams, assign members & permissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild><Button style={{ backgroundColor: BRAND }} className="text-white"><Plus className="h-4 w-4 mr-2" />Create Team</Button></DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create New Team</DialogTitle></DialogHeader>
              <TeamForm onSubmit={handleAdd} label="Create Team" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search teams..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Society</Label>
                  <select className="w-full p-2 border rounded-md text-sm" value={filterSociety} onChange={e => setFilterSociety(e.target.value)}>
                    <option value="all">All Societies</option>
                    {societies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Status</Label>
                  <select className="w-full p-2 border rounded-md text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-gray-500">Total Teams</p>
            <p className="text-2xl font-bold" style={{ color: BRAND }}>{teams.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600">{teams.filter(t => t.status === 'active').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-gray-500">Total Members</p>
            <p className="text-2xl font-bold text-blue-600">{teams.reduce((acc, t) => acc + (t.members || []).length, 0)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Teams ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-8">Loading...</div> : filtered.length === 0 ? (
            <div className="text-center py-12"><UsersRound className="h-12 w-12 mx-auto text-gray-300 mb-4" /><p className="text-gray-400">No teams found</p></div>
          ) : (
            <div className="space-y-4">
              {filtered.map(team => (
                <Card key={team.id} className="border hover:shadow-sm transition">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: BRAND + '15' }}>
                            <UsersRound className="h-5 w-5" style={{ color: BRAND }} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{team.name}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant={team.status === 'active' ? 'default' : 'secondary'}
                                className={`text-xs ${team.status === 'active' ? 'bg-green-500' : ''}`}>{team.status || 'active'}</Badge>
                              {team.societyId && <span className="text-xs text-gray-400">{getSocietyName(team.societyId)}</span>}
                            </div>
                          </div>
                        </div>
                        {team.description && <p className="text-sm text-gray-500 mt-2 ml-12">{team.description}</p>}

                        <div className="mt-3 ml-12 flex gap-8">
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Permissions:</p>
                            <div className="flex flex-wrap gap-1">
                              {(team.permissions || []).length > 0 ? (team.permissions || []).map(p => (
                                <Badge key={p} variant="outline" className="text-[10px] capitalize">{p}</Badge>
                              )) : <span className="text-xs text-gray-400">No permissions set</span>}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Members ({(team.members || []).length}):</p>
                            <div className="flex flex-wrap gap-1">
                              {(team.members || []).length > 0 ? (team.members || []).map(m => (
                                <Badge key={m} className="text-xs" style={{ backgroundColor: BRAND }}>{getUserName(m)}</Badge>
                              )) : <span className="text-xs text-gray-400">No members yet</span>}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1 ml-4">
                        <Button size="sm" variant="outline" onClick={() => { setSelected(team); setMemberOpen(true); }} title="Add Member"><UserPlus className="h-3 w-3" /></Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditOpen(team)}><Edit className="h-3 w-3" /></Button>
                        <Button size="sm" variant="outline" className="text-red-500" onClick={() => { setSelected(team); setDeleteOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit */}
      <Dialog open={editOpen} onOpenChange={o => { setEditOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Team: {selected?.name}</DialogTitle></DialogHeader>
          <TeamForm onSubmit={handleUpdate} label="Update Team" />
        </DialogContent>
      </Dialog>

      {/* Add Member */}
      <Dialog open={memberOpen} onOpenChange={o => { setMemberOpen(o); if (!o) setMemberUserId(''); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Member to: {selected?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select User</Label>
              <select className="w-full p-2 border rounded-md" value={memberUserId} onChange={e => setMemberUserId(e.target.value)}>
                <option value="">-- Select User --</option>
                {users.filter(u => !(selected?.members || []).includes(u.id)).map(u => (
                  <option key={u.id} value={u.id}>{u.name || u.userId} ({u.role?.replace(/_/g, ' ')})</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMemberOpen(false)}>Cancel</Button>
              <Button onClick={handleAddMember} style={{ backgroundColor: BRAND }} className="text-white">Add Member</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Team</DialogTitle></DialogHeader>
          <p>Delete team <strong>{selected?.name}</strong>?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
