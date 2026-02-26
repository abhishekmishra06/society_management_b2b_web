'use client';
import { useState } from 'react';
import { UserCheck, QrCode, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { COLORS } from '@/lib/constants/colors';
import { toast } from 'sonner';

export default function GuestPreApprovalPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    guestName: '',
    guestMobile: '',
    visitDate: '',
    visitTime: '',
    purpose: '',
  });

  const dummyPreApprovals = [
    { id: '1', guestName: 'Amit Kumar', mobile: '9876543210', flatNumber: 'A-101', visitDate: '2026-02-28', visitTime: '14:00', qrCode: 'QR-GUEST-001', status: 'active' },
    { id: '2', guestName: 'Priya Sharma', mobile: '9876543211', flatNumber: 'A-102', visitDate: '2026-02-28', visitTime: '16:00', qrCode: 'QR-GUEST-002', status: 'active' },
    { id: '3', guestName: 'Raj Patel', mobile: '9876543212', flatNumber: 'B-201', visitDate: '2026-02-27', visitTime: '10:00', qrCode: 'QR-GUEST-003', status: 'used' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const qrCode = `QR-GUEST-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    toast.success(`Guest pre-approved! QR Code: ${qrCode}`);
    setDialogOpen(false);
  };

  const handleGenerateQR = (approval) => {
    toast.success(`QR Code ${approval.qrCode} copied to clipboard!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Guest Pre-Approval</h1>
          <p className="text-muted-foreground mt-1">Resident pre-approves visitor + QR code generation</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: COLORS.primary }}>
              <Plus className="h-4 w-4 mr-2" />
              Pre-Approve Guest
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pre-Approve Guest</DialogTitle>
              <DialogDescription>Generate QR code for guest entry</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Guest Name *</Label>
                <Input value={formData.guestName} onChange={(e) => setFormData({...formData, guestName: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Guest Mobile *</Label>
                <Input value={formData.guestMobile} onChange={(e) => setFormData({...formData, guestMobile: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Visit Date *</Label>
                  <Input type="date" value={formData.visitDate} onChange={(e) => setFormData({...formData, visitDate: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Visit Time *</Label>
                  <Input type="time" value={formData.visitTime} onChange={(e) => setFormData({...formData, visitTime: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Input value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})} placeholder="Personal visit" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Generate QR Code</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Pre-Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dummyPreApprovals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active QR Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.success }}>{dummyPreApprovals.filter(a => a.status === 'active').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Used Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dummyPreApprovals.filter(a => a.status === 'used').length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pre-Approved Guests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dummyPreApprovals.map((approval) => (
              <Card key={approval.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{approval.guestName}</p>
                      <p className="text-sm text-muted-foreground">{approval.mobile}</p>
                    </div>
                    <Badge variant={approval.status === 'active' ? 'default' : 'secondary'}>
                      {approval.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Flat: {approval.flatNumber}</p>
                    <p className="text-muted-foreground">Date: {new Date(approval.visitDate).toLocaleDateString()}</p>
                    <p className="text-muted-foreground">Time: {approval.visitTime}</p>
                  </div>
                  <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                    <QrCode className="h-16 w-16" style={{ color: COLORS.primary }} />
                  </div>
                  <p className="text-xs font-mono text-center">{approval.qrCode}</p>
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleGenerateQR(approval)}
                  >
                    Share QR Code
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
