'use client';
import { useState } from 'react';
import { UserCheck, QrCode, Plus, Share2, Copy, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { COLORS } from '@/lib/constants/colors';
import { toast } from 'sonner';
import { validateForm, VALIDATION_RULES, formatMobile } from '@/lib/validation';
import { useTowers, useFlats } from '@/lib/api/queries';
import { useQueryClient } from '@tanstack/react-query';

export default function GuestPreApprovalPage() {
  const queryClient = useQueryClient();
  const { data: towers } = useTowers();
  const { data: allFlats } = useFlats();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState({});
  const [selectedTower, setSelectedTower] = useState('');
  const [preApprovals, setPreApprovals] = useState([
    { id: '1', guestName: 'Amit Kumar', mobile: '9876543210', flatNumber: 'A-101', visitDate: '2026-02-28', visitTime: '14:00', qrCode: 'QR-GUEST-001', status: 'active' },
    { id: '2', guestName: 'Priya Sharma', mobile: '9876543211', flatNumber: 'A-102', visitDate: '2026-02-28', visitTime: '16:00', qrCode: 'QR-GUEST-002', status: 'active' },
    { id: '3', guestName: 'Raj Patel', mobile: '9876543212', flatNumber: 'B-201', visitDate: '2026-02-27', visitTime: '10:00', qrCode: 'QR-GUEST-003', status: 'used' },
  ]);
  const [formData, setFormData] = useState({ guestName: '', guestMobile: '', flatNumber: '', visitDate: '', visitTime: '', purpose: '' });

  const flatsForTower = selectedTower ? (allFlats || []).filter(f => f.towerId === selectedTower) : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const { isValid, errors: ve } = validateForm(formData, {
      guestName: VALIDATION_RULES.name,
      guestMobile: VALIDATION_RULES.mobile,
      flatNumber: { required: true, message: 'Select a flat' },
      visitDate: { required: true, message: 'Visit date is required' },
    });
    if (!isValid) { setErrors(ve); return; }
    const qrCode = `QR-GUEST-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newApproval = { id: Date.now().toString(), ...formData, mobile: formData.guestMobile, qrCode, status: 'active' };
    setPreApprovals(prev => [newApproval, ...prev]);
    toast.success(`Guest pre-approved! QR: ${qrCode}`);
    setDialogOpen(false);
    setFormData({ guestName: '', guestMobile: '', flatNumber: '', visitDate: '', visitTime: '', purpose: '' });
    setSelectedTower('');
    setErrors({});
  };

  const handleShareQR = async (approval) => {
    const text = `Guest Pass - MyTower\n\nGuest: ${approval.guestName}\nFlat: ${approval.flatNumber}\nDate: ${approval.visitDate}\nTime: ${approval.visitTime}\nQR Code: ${approval.qrCode}\n\nShow this at the security gate.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Guest Pass - MyTower', text });
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('Guest pass details copied to clipboard!');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        toast.success('Guest pass details copied to clipboard!');
      } catch {
        toast.error('Copy failed. Please copy manually.');
      }
    }
  };

  const filtered = preApprovals.filter(a =>
    (a.guestName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.flatNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.mobile || '').includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Guest Pre-Approval</h1>
          <p className="text-muted-foreground mt-1">Pre-approve visitors with QR code generation & sharing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => queryClient.invalidateQueries()}><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button style={{ backgroundColor: COLORS.primary }} className="text-white"><Plus className="h-4 w-4 mr-2" />Pre-Approve Guest</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Pre-Approve Guest</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Guest Name *</Label>
                    <Input value={formData.guestName} onChange={(e) => { setFormData({...formData, guestName: e.target.value}); setErrors({...errors, guestName: null}); }} className={errors.guestName ? 'border-red-500' : ''} placeholder="Guest name" />
                    {errors.guestName && <p className="text-xs text-red-500">{errors.guestName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile * (10 digits)</Label>
                    <Input value={formData.guestMobile} onChange={(e) => { setFormData({...formData, guestMobile: formatMobile(e.target.value)}); setErrors({...errors, guestMobile: null}); }} className={errors.guestMobile ? 'border-red-500' : ''} maxLength={10} />
                    {errors.guestMobile && <p className="text-xs text-red-500">{errors.guestMobile}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tower *</Label>
                    <select className="w-full p-2 border rounded-md text-sm" value={selectedTower} onChange={(e) => { setSelectedTower(e.target.value); setFormData({...formData, flatNumber: ''}); }}>
                      <option value="">Select Tower</option>
                      {towers?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Flat *</Label>
                    <select className={`w-full p-2 border rounded-md text-sm ${errors.flatNumber ? 'border-red-500' : ''}`} value={formData.flatNumber} onChange={(e) => { setFormData({...formData, flatNumber: e.target.value}); setErrors({...errors, flatNumber: null}); }} disabled={!selectedTower}>
                      <option value="">{selectedTower ? 'Select Flat' : 'Select tower first'}</option>
                      {flatsForTower.map(f => <option key={f.id} value={f.flatNumber}>{f.flatNumber}</option>)}
                    </select>
                    {errors.flatNumber && <p className="text-xs text-red-500">{errors.flatNumber}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Visit Date *</Label>
                    <Input type="date" value={formData.visitDate} onChange={(e) => { setFormData({...formData, visitDate: e.target.value}); setErrors({...errors, visitDate: null}); }} className={errors.visitDate ? 'border-red-500' : ''} />
                    {errors.visitDate && <p className="text-xs text-red-500">{errors.visitDate}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Visit Time</Label>
                    <Input type="time" value={formData.visitTime} onChange={(e) => setFormData({...formData, visitTime: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Purpose</Label>
                  <Input value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})} placeholder="Personal visit" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Generate QR & Approve</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">Total Pre-Approvals</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{preApprovals.length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Active QR Codes</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.success }}>{preApprovals.filter(a => a.status === 'active').length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Used</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{preApprovals.filter(a => a.status === 'used').length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pre-Approved Guests</CardTitle>
            <div className="relative w-64"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <Card key={a.id} className="border-2" style={{ borderColor: a.status === 'active' ? COLORS.success : COLORS.border }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div><p className="font-semibold">{a.guestName}</p><p className="text-sm text-muted-foreground">{a.mobile}</p></div>
                    <Badge variant={a.status === 'active' ? 'default' : 'secondary'}>{a.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm"><p>Flat: {a.flatNumber}</p><p>Date: {a.visitDate} {a.visitTime}</p></div>
                  <div className="flex items-center justify-center p-4 bg-muted rounded-lg"><QrCode className="h-16 w-16" style={{ color: COLORS.primary }} /></div>
                  <p className="text-xs font-mono text-center">{a.qrCode}</p>
                  <Button className="w-full text-white" size="sm" style={{ backgroundColor: COLORS.primary }} onClick={() => handleShareQR(a)} disabled={a.status !== 'active'}>
                    <Share2 className="h-3 w-3 mr-1" />Share QR Code
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
