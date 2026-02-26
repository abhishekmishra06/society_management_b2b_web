'use client';
import { KeyRound, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/lib/constants/colors';
import { useGatePasses } from '@/lib/api/queries';
import { toast } from 'sonner';

export default function GatePassPage() {
  const dummyPasses = [
    { id: 'GP-001', flatNumber: 'A-101', residentName: 'John Doe', visitorName: 'Guest 1', purpose: 'Personal', validFrom: '2026-02-28T10:00', validUntil: '2026-02-28T18:00', qrCode: 'QR-GP-001', status: 'active' },
    { id: 'GP-002', flatNumber: 'A-102', residentName: 'Jane Smith', visitorName: 'Guest 2', purpose: 'Business', validFrom: '2026-02-28T14:00', validUntil: '2026-02-28T20:00', qrCode: 'QR-GP-002', status: 'active' },
    { id: 'GP-003', flatNumber: 'B-201', residentName: 'Bob Wilson', visitorName: 'Guest 3', purpose: 'Delivery', validFrom: '2026-02-27T09:00', validUntil: '2026-02-27T12:00', qrCode: 'QR-GP-003', status: 'expired' },
  ];

  const handleShareQR = (pass) => {
    toast.success(`Gate pass ${pass.id} QR code shared!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Gate Pass System</h1>
        <p className="text-muted-foreground mt-1">Gate passes with QR code sharing</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Passes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.success }}>{dummyPasses.filter(p => p.status === 'active').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dummyPasses.filter(p => p.status === 'expired').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dummyPasses.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gate Passes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dummyPasses.map((pass) => (
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
                    <p>Valid From: {new Date(pass.validFrom).toLocaleString()}</p>
                    <p>Valid Until: {new Date(pass.validUntil).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                    <QrCode className="h-20 w-20" style={{ color: pass.status === 'active' ? COLORS.primary : COLORS.textSecondary }} />
                  </div>
                  <p className="text-xs font-mono text-center">{pass.qrCode}</p>
                  <Button 
                    className="w-full" 
                    size="sm" 
                    style={{ backgroundColor: COLORS.primary }}
                    onClick={() => handleShareQR(pass)}
                    disabled={pass.status !== 'active'}
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
