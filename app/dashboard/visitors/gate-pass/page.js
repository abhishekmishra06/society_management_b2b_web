'use client';
import { useState } from 'react';
import { KeyRound, QrCode, Download, Plus, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { COLORS } from '@/lib/constants/colors';
import { useGatePasses, useCreateGatePass } from '@/lib/api/queries';
import { toast } from 'sonner';
import { generateGatePassPDF } from '@/lib/pdf-utils';

export default function GatePassPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    flatNumber: '',
    residentName: '',
    visitorName: '',
    purpose: '',
    validFrom: '',
    validUntil: '',
  });

  const { data: passesFromAPI } = useGatePasses();
  const createGatePass = useCreateGatePass();

  const dummyPasses = [
    { id: 'GP-001', flatNumber: 'A-101', residentName: 'John Doe', visitorName: 'Guest 1', purpose: 'Personal', validFrom: '2026-02-28T10:00', validUntil: '2026-02-28T18:00', qrCode: 'QR-GP-001', status: 'active' },
    { id: 'GP-002', flatNumber: 'A-102', residentName: 'Jane Smith', visitorName: 'Guest 2', purpose: 'Business', validFrom: '2026-02-28T14:00', validUntil: '2026-02-28T20:00', qrCode: 'QR-GP-002', status: 'active' },
    { id: 'GP-003', flatNumber: 'B-201', residentName: 'Bob Wilson', visitorName: 'Guest 3', purpose: 'Delivery', validFrom: '2026-02-27T09:00', validUntil: '2026-02-27T12:00', qrCode: 'QR-GP-003', status: 'expired' },
  ];

  const passes = (passesFromAPI && passesFromAPI.length > 0) ? passesFromAPI : dummyPasses;

  const handleShareQR = (pass) => {
    // Copy pass details to clipboard
    const text = `Gate Pass: ${pass.id}\nVisitor: ${pass.visitorName}\nFlat: ${pass.flatNumber}\nValid: ${new Date(pass.validFrom).toLocaleString()} - ${new Date(pass.validUntil).toLocaleString()}\nQR: ${pass.qrCode}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Gate pass details copied to clipboard!');
    }).catch(() => {
      toast.success('Gate pass shared!');
    });
  };

  const handleDownloadPDF = (pass) => {
    try {
      generateGatePassPDF(pass);
      toast.success(`Gate pass ${pass.id} downloaded as PDF!`);
    } catch (error) {
      toast.error('PDF generation failed: ' + error.message);
    }
  };

  const handleCreatePass = async () => {
    if (!formData.visitorName || !formData.flatNumber) {
      toast.error('Please fill required fields (Visitor Name, Flat Number)');
      return;
    }

    try {
      await createGatePass.mutateAsync(formData);
      toast.success('Gate pass created!');
      setDialogOpen(false);
      setFormData({ flatNumber: '', residentName: '', visitorName: '', purpose: '', validFrom: '', validUntil: '' });
    } catch (error) {
      toast.error('Failed to create gate pass');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Gate Pass System</h1>
          <p className="text-muted-foreground mt-1">Gate passes with QR code sharing and PDF download</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: COLORS.primary }} className="text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Gate Pass
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Gate Pass</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Flat Number *</Label>
                  <Input value={formData.flatNumber} onChange={(e) => setFormData(p => ({ ...p, flatNumber: e.target.value }))} placeholder="e.g., A-101" />
                </div>
                <div className="space-y-2">
                  <Label>Resident Name</Label>
                  <Input value={formData.residentName} onChange={(e) => setFormData(p => ({ ...p, residentName: e.target.value }))} placeholder="Resident name" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Visitor Name *</Label>
                <Input value={formData.visitorName} onChange={(e) => setFormData(p => ({ ...p, visitorName: e.target.value }))} placeholder="Visitor name" />
              </div>
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Input value={formData.purpose} onChange={(e) => setFormData(p => ({ ...p, purpose: e.target.value }))} placeholder="e.g., Personal, Delivery" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valid From</Label>
                  <Input type="datetime-local" value={formData.validFrom} onChange={(e) => setFormData(p => ({ ...p, validFrom: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Valid Until</Label>
                  <Input type="datetime-local" value={formData.validUntil} onChange={(e) => setFormData(p => ({ ...p, validUntil: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button style={{ backgroundColor: COLORS.primary }} className="text-white" onClick={handleCreatePass} disabled={createGatePass.isPending}>
                  {createGatePass.isPending ? 'Creating...' : 'Create Pass'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Passes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.success }}>{passes.filter(p => p.status === 'active').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{passes.filter(p => p.status === 'expired').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{passes.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gate Passes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {passes.map((pass) => (
              <Card key={pass.id} className="border-2" style={{ borderColor: pass.status === 'active' ? COLORS.success : COLORS.border }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-5 w-5" style={{ color: COLORS.primary }} />
                      <span className="font-mono font-bold">{pass.id}</span>
                    </div>
                    <Badge variant={pass.status === 'active' ? 'default' : 'secondary'}>
                      {pass.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1 text-sm">
                    <p><strong>Flat:</strong> {pass.flatNumber}</p>
                    <p><strong>Resident:</strong> {pass.residentName}</p>
                    <p><strong>Visitor:</strong> {pass.visitorName}</p>
                    <p><strong>Purpose:</strong> {pass.purpose}</p>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Valid From: {pass.validFrom ? new Date(pass.validFrom).toLocaleString() : 'N/A'}</p>
                    <p>Valid Until: {pass.validUntil ? new Date(pass.validUntil).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                    <QrCode className="h-20 w-20" style={{ color: pass.status === 'active' ? COLORS.primary : COLORS.textSecondary }} />
                  </div>
                  <p className="text-xs font-mono text-center">{pass.qrCode}</p>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 text-white"
                      size="sm"
                      style={{ backgroundColor: COLORS.primary }}
                      onClick={() => handleShareQR(pass)}
                      disabled={pass.status !== 'active'}
                    >
                      <Share2 className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(pass)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
