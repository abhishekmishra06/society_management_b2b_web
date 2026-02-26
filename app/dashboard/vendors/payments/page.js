'use client';
import { DollarSign, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/lib/constants/colors';
import { useVendorPayments } from '@/lib/api/queries';
import { toast } from 'sonner';

export default function VendorPaymentsPage() {
  const dummyPayments = [
    { id: 'VP-001', vendorName: 'ABC Cleaning Services', serviceType: 'Housekeeping', amount: 25000, invoiceNumber: 'INV-2026-001', paymentDate: '2026-02-15', paymentMethod: 'Bank Transfer', status: 'completed' },
    { id: 'VP-002', vendorName: 'XYZ Security Systems', serviceType: 'Security Equipment', amount: 45000, invoiceNumber: 'INV-2026-002', paymentDate: '2026-02-20', paymentMethod: 'Cheque', status: 'completed' },
    { id: 'VP-003', vendorName: 'Green Landscaping', serviceType: 'Garden Maintenance', amount: 18000, invoiceNumber: 'INV-2026-003', paymentDate: null, paymentMethod: null, status: 'pending' },
  ];

  const totalPaid = dummyPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = dummyPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  const handleDownloadReceipt = (payment) => {
    toast.success(`Receipt downloaded for ${payment.vendorName}`);
  };

  const handleMakePayment = (payment) => {
    toast.success(`Payment initiated for ${payment.vendorName}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Vendor Payments</h1>
        <p className="text-muted-foreground mt-1">Payment records, invoice tracking, receipt PDF</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{(totalPaid + totalPending).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.success }}>₹{totalPaid.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.error }}>₹{totalPending.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dummyPayments.filter(p => p.paymentDate?.startsWith('2026-02')).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Invoice No.</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono font-medium">{payment.id}</TableCell>
                  <TableCell>{payment.vendorName}</TableCell>
                  <TableCell>{payment.serviceType}</TableCell>
                  <TableCell className="font-mono text-xs">{payment.invoiceNumber}</TableCell>
                  <TableCell className="font-bold">₹{payment.amount.toLocaleString()}</TableCell>
                  <TableCell className="capitalize">{payment.paymentMethod || '-'}</TableCell>
                  <TableCell>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={payment.status === 'completed' ? 'default' : 'destructive'}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {payment.status === 'completed' && (
                        <Button size="sm" variant="outline" onClick={() => handleDownloadReceipt(payment)}>
                          <FileText className="h-3 w-3 mr-1" />
                          Receipt
                        </Button>
                      )}
                      {payment.status === 'pending' && (
                        <Button size="sm" style={{ backgroundColor: COLORS.primary }} onClick={() => handleMakePayment(payment)}>
                          <DollarSign className="h-3 w-3 mr-1" />
                          Pay Now
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Bank Transfer</span>
                <span className="font-medium">1 payment</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cheque</span>
                <span className="font-medium">1 payment</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cash</span>
                <span className="font-medium">0 payments</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Vendors by Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dummyPayments.sort((a, b) => b.amount - a.amount).slice(0, 3).map((payment, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm truncate">{payment.vendorName}</span>
                  <span className="font-medium">₹{payment.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
