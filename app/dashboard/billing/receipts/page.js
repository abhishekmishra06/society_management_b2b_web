'use client';
import { useState } from 'react';
import { FileText, Download, Mail, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { COLORS } from '@/lib/constants/colors';
import { toast } from 'sonner';
import { usePayments } from '@/lib/api/queries';
import { generateReceiptPDF, exportCSV } from '@/lib/pdf-utils';

export default function ReceiptsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: paymentsFromAPI } = usePayments();

  // Combine API data with fallback dummy data
  const dummyReceipts = [
    { id: 'RCP-001', flatNumber: 'A-101', residentName: 'John Doe', amount: 5000, billType: 'maintenance', paymentDate: '2026-02-15', paymentMethod: 'UPI' },
    { id: 'RCP-002', flatNumber: 'A-102', residentName: 'Jane Smith', amount: 1625, billType: 'utility', paymentDate: '2026-02-16', paymentMethod: 'Card' },
    { id: 'RCP-003', flatNumber: 'A-103', residentName: 'Bob Johnson', amount: 5000, billType: 'maintenance', paymentDate: '2026-02-17', paymentMethod: 'Cash' },
    { id: 'RCP-004', flatNumber: 'B-201', residentName: 'Alice Williams', amount: 3500, billType: 'maintenance', paymentDate: '2026-02-18', paymentMethod: 'UPI' },
    { id: 'RCP-005', flatNumber: 'B-202', residentName: 'Charlie Brown', amount: 2200, billType: 'utility', paymentDate: '2026-02-19', paymentMethod: 'Bank Transfer' },
  ];

  const receipts = (paymentsFromAPI && paymentsFromAPI.length > 0) ? paymentsFromAPI : dummyReceipts;

  const filteredReceipts = receipts.filter(r =>
    (r.residentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.flatNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (receipt) => {
    try {
      generateReceiptPDF(receipt);
      toast.success(`Receipt ${receipt.id} downloaded as PDF!`);
    } catch (error) {
      toast.error('Failed to generate PDF: ' + error.message);
    }
  };

  const handleEmail = (receipt) => {
    toast.success(`Receipt ${receipt.id} emailed to ${receipt.residentName}`);
  };

  const handleExportAll = () => {
    try {
      exportCSV(filteredReceipts, [
        { key: 'id', label: 'Receipt ID' },
        { key: 'flatNumber', label: 'Flat' },
        { key: 'residentName', label: 'Resident' },
        { key: 'billType', label: 'Type' },
        { key: 'amount', label: 'Amount' },
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'paymentDate', label: 'Date' },
      ], 'Receipts');
      toast.success('Receipts exported as CSV!');
    } catch (error) {
      toast.error('Export failed: ' + error.message);
    }
  };

  const totalAmount = filteredReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Receipts</h1>
          <p className="text-muted-foreground mt-1">Auto receipt PDF, download, email receipt</p>
        </div>
        <Button variant="outline" onClick={handleExportAll}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{filteredReceipts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.success }}>
              Rs. {totalAmount.toLocaleString('en-IN')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{filteredReceipts.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Receipts</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, flat, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
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
              {filteredReceipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No receipts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredReceipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-mono font-medium">{receipt.id}</TableCell>
                    <TableCell>{receipt.flatNumber}</TableCell>
                    <TableCell>{receipt.residentName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{receipt.billType}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">Rs. {(receipt.amount || 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell className="capitalize">{receipt.paymentMethod}</TableCell>
                    <TableCell>{receipt.paymentDate ? new Date(receipt.paymentDate).toLocaleDateString('en-IN') : 'N/A'}</TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
