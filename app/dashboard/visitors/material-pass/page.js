'use client';
import { Package, FileDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/lib/constants/colors';
import { toast } from 'sonner';
import { generateMaterialExitPassPDF } from '@/lib/pdf-utils';

export default function MaterialExitPassPage() {
  const dummyPasses = [
    { id: 'MEP-001', flatNumber: 'A-101', items: 'Old furniture - 2 chairs, 1 table', approvedBy: 'Admin', status: 'approved', requestDate: '2026-02-28', exitDate: '2026-02-28' },
    { id: 'MEP-002', flatNumber: 'B-201', items: 'Electronics - 1 TV, 1 Laptop', approvedBy: null, status: 'pending', requestDate: '2026-02-28', exitDate: null },
    { id: 'MEP-003', flatNumber: 'A-102', items: 'Scrap material', approvedBy: 'Admin', status: 'used', requestDate: '2026-02-27', exitDate: '2026-02-27' },
  ];

  const handleApprove = (pass) => {
    toast.success(`Material exit pass ${pass.id} approved!`);
  };

  const handleDownloadPDF = (pass) => {
    try {
      generateMaterialExitPassPDF({
        id: pass.id,
        flatNumber: pass.flatNumber,
        residentName: 'Resident',
        materialDescription: pass.items,
        quantity: '1',
        carrierName: 'N/A',
        carrierContact: 'N/A',
        date: pass.exitDate || pass.requestDate,
      });
      toast.success(`Material exit pass ${pass.id} downloaded as PDF!`);
    } catch (error) {
      toast.error('PDF generation failed: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Material Exit Gate Pass</h1>
        <p className="text-muted-foreground mt-1">Item description, approval required, PDF generate</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Passes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dummyPasses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.warning }}>{dummyPasses.filter(p => p.status === 'pending').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.success }}>{dummyPasses.filter(p => p.status === 'approved').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Used</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dummyPasses.filter(p => p.status === 'used').length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Material Exit Passes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pass ID</TableHead>
                <TableHead>Flat</TableHead>
                <TableHead>Items Description</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Exit Date</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyPasses.map((pass) => (
                <TableRow key={pass.id}>
                  <TableCell className="font-mono font-medium">{pass.id}</TableCell>
                  <TableCell>{pass.flatNumber}</TableCell>
                  <TableCell className="max-w-xs truncate">{pass.items}</TableCell>
                  <TableCell>{new Date(pass.requestDate).toLocaleDateString()}</TableCell>
                  <TableCell>{pass.exitDate ? new Date(pass.exitDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{pass.approvedBy || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={pass.status === 'approved' ? 'default' : pass.status === 'pending' ? 'secondary' : 'outline'}>
                      {pass.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {pass.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => handleApprove(pass)}>
                          Approve
                        </Button>
                      )}
                      {pass.status === 'approved' && (
                        <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(pass)}>
                          <FileDown className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
