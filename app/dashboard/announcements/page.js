'use client';
import { useState } from 'react';
import { MessageSquare, Plus, Search, RefreshCw, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { COLORS } from '@/lib/constants/colors';
import { useAnnouncements, useCreateAnnouncement } from '@/lib/api/queries';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function AnnouncementsPage() {
  const queryClient = useQueryClient();
  const { data: announcementsFromAPI, isLoading } = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ title: '', content: '', type: 'general' });
  const [errors, setErrors] = useState({});

  const dummyAnnouncements = [
    { id: '1', title: 'Holi Celebration', content: 'Grand Holi celebration on March 14th at the garden area. All residents welcome! Refreshments provided.', type: 'event', createdAt: '2026-02-28T08:00:00' },
    { id: '2', title: 'New Gym Equipment', content: 'New treadmills and weight machines installed in the society gym. Timings: 6 AM - 10 PM.', type: 'general', createdAt: '2026-02-26T12:00:00' },
    { id: '3', title: 'Security Alert', content: 'Please ensure all visitors are registered at the gate. Report any suspicious activity to security.', type: 'alert', createdAt: '2026-02-24T15:00:00' },
  ];

  const announcements = (announcementsFromAPI && announcementsFromAPI.length > 0) ? announcementsFromAPI : dummyAnnouncements;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { setErrors({ title: 'Title is required' }); return; }
    if (!formData.content.trim()) { setErrors({ content: 'Content is required' }); return; }
    try {
      await createAnnouncement.mutateAsync(formData);
      toast.success('Announcement posted!');
      setDialogOpen(false);
      setFormData({ title: '', content: '', type: 'general' });
      setErrors({});
    } catch (error) {
      toast.error('Failed to post announcement');
    }
  };

  const filtered = announcements.filter(a =>
    (a.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || (a.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const typeColors = { event: COLORS.success, alert: COLORS.error, general: COLORS.primary, update: COLORS.warning };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Announcements</h1>
          <p className="text-muted-foreground mt-1">Society-wide announcements and updates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => queryClient.invalidateQueries()}><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button style={{ backgroundColor: COLORS.primary }} className="text-white"><Plus className="h-4 w-4 mr-2" />New Announcement</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Post Announcement</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={formData.title} onChange={(e) => { setFormData({...formData, title: e.target.value}); setErrors({...errors, title: null}); }} className={errors.title ? 'border-red-500' : ''} placeholder="Announcement title" />
                  {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Content *</Label>
                  <Textarea value={formData.content} onChange={(e) => { setFormData({...formData, content: e.target.value}); setErrors({...errors, content: null}); }} className={errors.content ? 'border-red-500' : ''} placeholder="Write your announcement..." rows={5} />
                  {errors.content && <p className="text-xs text-red-500">{errors.content}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select className="w-full p-2 border rounded-md" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="general">General</option>
                    <option value="event">Event</option>
                    <option value="alert">Alert</option>
                    <option value="update">Update</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createAnnouncement.isPending}>{createAnnouncement.isPending ? 'Posting...' : 'Post Announcement'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search announcements..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>

      <div className="grid gap-4">
        {isLoading ? <div className="text-center py-8">Loading...</div> : filtered.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center py-12"><Megaphone className="h-12 w-12 text-muted-foreground mb-4" /><p className="text-muted-foreground">No announcements yet</p></CardContent></Card>
        ) : filtered.map((a) => (
          <Card key={a.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{a.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{new Date(a.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <Badge style={{ backgroundColor: (typeColors[a.type] || COLORS.primary), color: 'white' }}>{a.type}</Badge>
              </div>
            </CardHeader>
            <CardContent><p className="text-sm whitespace-pre-wrap">{a.content}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
