'use client';
import { FileText, Download, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { COLORS } from '@/lib/constants/colors';
import { toast } from 'sonner';

export default function ReceiptsPage() {
  const dummyReceipts = [
    { id: 'RCP-001', flatNumber: 'A-101', residentName: 'John Doe', amount: 5000, billType: 'maintenance', paymentDate: '2026-02-15', paymentMethod: 'UPI' },
    { id: 'RCP-002', flatNumber: 'A-102', residentName: 'Jane Smith', amount: 1625, billType: 'utility', paymentDate: '2026-02-16', paymentMethod: 'Card' },
    { id: 'RCP-003', flatNumber: 'A-103', residentName: 'Bob Johnson', amount: 5000, billType: 'maintenance', paymentDate: '2026-02-17', paymentMethod: 'Cash' },
  ];

  const handleDownload = (receipt) => {
    toast.success(`Downloading receipt ${receipt.id}`);
  };

  const handleEmail = (receipt) => {
    toast.success(`Receipt emailed to ${receipt.residentName}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Receipts</h1>
        <p className="text-muted-foreground mt-1">Auto receipt PDF, download, email receipt</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dummyReceipts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.success }}>₹{dummyReceipts.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dummyReceipts.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt ID</TableHead>
                <TableHead>Flat</TableHead>
                <TableHead>Resident</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyReceipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-mono font-medium">{receipt.id}</TableCell>
                  <TableCell>{receipt.flatNumber}</TableCell>
                  <TableCell>{receipt.residentName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{receipt.billType}</Badge>
                  </TableCell>
                  <TableCell>₹{receipt.amount}</TableCell>
                  <TableCell className="capitalize">{receipt.paymentMethod}</TableCell>
                  <TableCell>{new Date(receipt.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDownload(receipt)}>
                        <Download className="h-3 w-3 mr-1" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEmail(receipt)}>
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Button>
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
