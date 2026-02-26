'use client';
import { FileSignature, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/lib/constants/colors';
import { useAMC } from '@/lib/api/queries';
import { toast } from 'sonner';

export default function AMCPage() {
  const dummyAMCs = [
    { id: 'AMC-001', equipmentName: 'Elevator System', vendorName: 'Otis Elevators', startDate: '2026-01-01', endDate: '2026-12-31', amount: 120000, nextServiceDate: '2026-03-15', status: 'active', daysUntilExpiry: 308 },
    { id: 'AMC-002', equipmentName: 'Fire Fighting System', vendorName: 'Fire Safety Inc', startDate: '2025-06-01', endDate: '2026-05-31', amount: 85000, nextServiceDate: '2026-03-01', status: 'active', daysUntilExpiry: 93 },
    { id: 'AMC-003', equipmentName: 'Water Pumps', vendorName: 'Aqua Systems', startDate: '2025-09-01', endDate: '2026-08-31', amount: 65000, nextServiceDate: '2026-03-10', status: 'active', daysUntilExpiry: 185 },
    { id: 'AMC-004', equipmentName: 'Generator', vendorName: 'Power Solutions', startDate: '2025-04-01', endDate: '2026-03-31', amount: 95000, nextServiceDate: '2026-02-28', status: 'expiring_soon', daysUntilExpiry: 33 },
  ];

  const totalAMCValue = dummyAMCs.reduce((sum, amc) => sum + amc.amount, 0);
  const expiringSoon = dummyAMCs.filter(amc => amc.daysUntilExpiry < 60).length;

  const handleRenewAlert = (amc) => {
    toast.info(`Renewal alert sent for ${amc.equipmentName}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>AMC Management</h1>
        <p className="text-muted-foreground mt-1">Annual maintenance contracts, next service dates</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total AMCs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dummyAMCs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Annual Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{totalAMCValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.success }}>{dummyAMCs.filter(a => a.status === 'active').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              Expiring Soon
              {expiringSoon > 0 && <AlertCircle className="h-4 w-4" style={{ color: COLORS.warning }} />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.warning }}>{expiringSoon}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AMC Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dummyAMCs.map((amc) => (
              <div 
                key={amc.id} 
                className="p-4 border-2 rounded-lg"
                style={{ borderColor: amc.daysUntilExpiry < 60 ? COLORS.warning : COLORS.border }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileSignature className="h-5 w-5" style={{ color: COLORS.primary }} />
                      <h3 className="font-bold text-lg">{amc.equipmentName}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{amc.vendorName}</p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={amc.status === 'active' ? 'default' : 'secondary'}
                      className="mb-2"
                    >
                      {amc.status.replace('_', ' ')}
                    </Badge>
                    <p className="text-sm font-mono">{amc.id}</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Contract Period</p>
                    <p className="font-medium">
                      {new Date(amc.startDate).toLocaleDateString()} - {new Date(amc.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Annual Amount</p>
                    <p className="font-bold">₹{amc.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Next Service</p>
                    <p className="font-medium">{new Date(amc.nextServiceDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Days Until Expiry</p>
                    <p 
                      className="font-bold"
                      style={{ color: amc.daysUntilExpiry < 60 ? COLORS.warning : COLORS.success }}
                    >
                      {amc.daysUntilExpiry} days
                    </p>
                  </div>
                </div>

                {amc.daysUntilExpiry < 60 && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" style={{ color: COLORS.warning }} />
                      <span className="text-sm font-medium">Renewal required soon!</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRenewAlert(amc)}
                    >
                      Send Alert
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dummyAMCs.sort((a, b) => new Date(a.nextServiceDate) - new Date(b.nextServiceDate)).map((amc) => (
              <div key={amc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{amc.equipmentName}</p>
                  <p className="text-sm text-muted-foreground">{amc.vendorName}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{new Date(amc.nextServiceDate).toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.ceil((new Date(amc.nextServiceDate) - new Date()) / (1000 * 60 * 60 * 24))} days away
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
