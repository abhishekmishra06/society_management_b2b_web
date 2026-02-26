'use client';
import { useState } from 'react';
import { Plus, Bell, Search, RefreshCw, Trash2, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { COLORS } from '@/lib/constants/colors';
import { useNotices, useCreateNotice } from '@/lib/api/queries';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function NoticesPage() {
  const queryClient = useQueryClient();
  const { data: noticesFromAPI, isLoading } = useNotices();
  const createNotice = useCreateNotice();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [formData, setFormData] = useState({ title: '', content: '', priority: 'normal', pinned: false });
  const [errors, setErrors] = useState({});

  const dummyNotices = [
    { id: '1', title: 'Water Supply Disruption', content: 'Water supply will be disrupted on March 1st from 10 AM to 4 PM due to tank cleaning.', priority: 'high', pinned: true, createdAt: '2026-02-28T10:00:00' },
    { id: '2', title: 'Monthly Meeting', content: 'Society monthly meeting on March 5th at 7 PM in the clubhouse.', priority: 'normal', pinned: false, createdAt: '2026-02-27T14:00:00' },
    { id: '3', title: 'Parking Rules Update', content: 'New parking rules effective from March 1st. Please read the notice board for details.', priority: 'medium', pinned: false, createdAt: '2026-02-25T09:00:00' },
  ];

  const notices = (noticesFromAPI && noticesFromAPI.length > 0) ? noticesFromAPI : dummyNotices;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { setErrors({ title: 'Title is required' }); return; }
    if (!formData.content.trim()) { setErrors({ content: 'Content is required' }); return; }
    try {
      await createNotice.mutateAsync(formData);
      toast.success('Notice created successfully!');
      setDialogOpen(false);
      setFormData({ title: '', content: '', priority: 'normal', pinned: false });
      setErrors({});
    } catch (error) {
      toast.error('Failed to create notice');
    }
  };

  const filtered = notices.filter(n => {
    const matchSearch = (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || (n.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchPriority = !filterPriority || n.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  const priorityColors = { high: COLORS.error, medium: COLORS.warning, normal: COLORS.primary, low: COLORS.textSecondary };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Notice Board</h1>
          <p className="text-muted-foreground mt-1">Society notices and important updates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => queryClient.invalidateQueries()}><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button style={{ backgroundColor: COLORS.primary }} className="text-white"><Plus className="h-4 w-4 mr-2" />New Notice</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New Notice</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={formData.title} onChange={(e) => { setFormData({...formData, title: e.target.value}); setErrors({...errors, title: null}); }} className={errors.title ? 'border-red-500' : ''} placeholder="Notice title" />
                  {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Content *</Label>
                  <Textarea value={formData.content} onChange={(e) => { setFormData({...formData, content: e.target.value}); setErrors({...errors, content: null}); }} className={errors.content ? 'border-red-500' : ''} placeholder="Notice content..." rows={5} />
                  {errors.content && <p className="text-xs text-red-500">{errors.content}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <select className="w-full p-2 border rounded-md" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="space-y-2 flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.pinned} onChange={(e) => setFormData({...formData, pinned: e.target.checked})} className="w-4 h-4" />
                      <Pin className="h-4 w-4" /> Pin to top
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createNotice.isPending}>{createNotice.isPending ? 'Creating...' : 'Post Notice'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search notices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
        <select className="p-2 border rounded-md text-sm" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="grid gap-4">
        {isLoading ? <div className="text-center py-8">Loading...</div> : filtered.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center py-12"><Bell className="h-12 w-12 text-muted-foreground mb-4" /><p className="text-muted-foreground">No notices found</p></CardContent></Card>
        ) : filtered.map((notice) => (
          <Card key={notice.id} className={notice.pinned ? 'border-2' : ''} style={notice.pinned ? { borderColor: COLORS.primary } : {}}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {notice.pinned && <Pin className="h-4 w-4" style={{ color: COLORS.primary }} />}
                    <CardTitle>{notice.title}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{new Date(notice.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <Badge style={{ backgroundColor: (priorityColors[notice.priority] || COLORS.primary) + '20', color: priorityColors[notice.priority] || COLORS.primary }}>{notice.priority}</Badge>
              </div>
            </CardHeader>
            <CardContent><p className="text-sm whitespace-pre-wrap">{notice.content}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
