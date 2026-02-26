'use client';
import { useState } from 'react';
import { Plus, CreditCard, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { usePayments, useCreatePayment, useMaintenanceBills } from '@/lib/api/queries';
import { toast } from 'sonner';
import { generateReceiptPDF, exportCSV } from '@/lib/pdf-utils';

export default function PaymentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    flatNumber: '',
    billId: '',
    amount: '',
    paymentMethod: 'upi',
    transactionId: '',
  });

  const { data: paymentsFromAPI } = usePayments();
  const { data: bills } = useMaintenanceBills();
  const createPayment = useCreatePayment();

  const dummyPayments = [
    { id: 'PAY-001', flatNumber: 'A-101', amount: 5000, paymentMethod: 'upi', transactionId: 'TXN123', paymentDate: '2026-02-15', residentName: 'John Doe', billType: 'maintenance' },
    { id: 'PAY-002', flatNumber: 'A-102', amount: 1625, paymentMethod: 'card', transactionId: 'TXN456', paymentDate: '2026-02-16', residentName: 'Jane Smith', billType: 'utility' },
    { id: 'PAY-003', flatNumber: 'A-103', amount: 5000, paymentMethod: 'cash', transactionId: 'CASH001', paymentDate: '2026-02-17', residentName: 'Bob Johnson', billType: 'maintenance' },
  ];

  const payments = (paymentsFromAPI && paymentsFromAPI.length > 0) ? paymentsFromAPI : dummyPayments;
  const pendingBills = bills?.filter(b => b.status === 'pending') || [];
  const totalCollected = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPayment.mutateAsync(formData);
      toast.success('Payment recorded successfully!');
      setDialogOpen(false);
      setFormData({ flatNumber: '', billId: '', amount: '', paymentMethod: 'upi', transactionId: '' });
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  const handleDownloadReceipt = (payment) => {
    try {
      generateReceiptPDF(payment);
      toast.success('Receipt PDF downloaded!');
    } catch (error) {
      toast.error('PDF generation failed: ' + error.message);
    }
  };

  const handleExportCSV = () => {
    exportCSV(payments, [
      { key: 'id', label: 'Payment ID' },
      { key: 'flatNumber', label: 'Flat' },
      { key: 'amount', label: 'Amount' },
      { key: 'paymentMethod', label: 'Method' },
      { key: 'transactionId', label: 'Transaction ID' },
      { key: 'paymentDate', label: 'Date' },
    ], 'Payments');
    toast.success('Exported to CSV!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Payment Collection</h1>
          <p className="text-muted-foreground mt-1">Record and track payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: COLORS.primary }}>
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogDescription>Record a payment for a maintenance bill</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Bill *</Label>
                  <select className="w-full p-2 border rounded-md" value={formData.billId} onChange={(e) => { const bill = pendingBills.find(b => b.id === e.target.value); setFormData({...formData, billId: e.target.value, flatNumber: bill?.flatNumber || '', amount: bill?.amount || ''}); }} required>
                    <option value="">Select Bill</option>
                    {pendingBills?.map(b => <option key={b.id} value={b.id}>{b.flatNumber} - {b.month} - Rs. {b.amount}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount *</Label>
                    <Input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method *</Label>
                    <select className="w-full p-2 border rounded-md" value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Transaction ID</Label>
                  <Input value={formData.transactionId} onChange={(e) => setFormData({...formData, transactionId: e.target.value})} placeholder="TXN123456789" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={createPayment.isPending}>{createPayment.isPending ? 'Recording...' : 'Record Payment'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">Total Collected</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.success }}>Rs. {totalCollected.toLocaleString('en-IN')}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Pending Bills</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.warning }}>{pendingBills.length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Total Payments</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.primary }}>{payments.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Payments</CardTitle></CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12"><CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No payments yet</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flat</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.flatNumber}</TableCell>
                    <TableCell>Rs. {Number(payment.amount).toLocaleString('en-IN')}</TableCell>
                    <TableCell className="capitalize">{(payment.paymentMethod || '').replace('_', ' ')}</TableCell>
                    <TableCell>{payment.transactionId || 'N/A'}</TableCell>
                    <TableCell>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('en-IN') : 'N/A'}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadReceipt(payment)}>
                        <Download className="h-3 w-3 mr-1" />
                        Receipt
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
