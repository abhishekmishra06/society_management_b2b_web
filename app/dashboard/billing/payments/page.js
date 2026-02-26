'use client';
import { useState } from 'react';
import { Plus, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { usePayments, useCreatePayment, useMaintenanceBills } from '@/lib/api/queries';
import { toast } from 'sonner';

export default function PaymentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    flatNumber: '',
    billId: '',
    amount: '',
    paymentMethod: 'upi',
    transactionId: '',
  });

  const { data: payments } = usePayments();
  const { data: bills } = useMaintenanceBills();
  const createPayment = useCreatePayment();

  const pendingBills = bills?.filter(b => b.status === 'pending') || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPayment.mutateAsync(formData);
      toast.success('Payment recorded successfully!');
      setDialogOpen(false);
      setFormData({
        flatNumber: '',
        billId: '',
        amount: '',
        paymentMethod: 'upi',
        transactionId: '',
      });
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Payment Collection</h1>
          <p className="text-muted-foreground mt-1">Record and track payments</p>
        </div>
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
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.billId}
                  onChange={(e) => {
                    const bill = pendingBills.find(b => b.id === e.target.value);
                    setFormData({...formData, billId: e.target.value, flatNumber: bill?.flatNumber || '', amount: bill?.amount || ''});
                  }}
                  required
                >
                  <option value="">Select Bill</option>
                  {pendingBills?.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.flatNumber} - {b.month} - ₹{b.amount}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method *</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  >
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Transaction ID</Label>
                <Input
                  value={formData.transactionId}
                  onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                  placeholder="TXN123456789"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={createPayment.isPending}>
                  {createPayment.isPending ? 'Recording...' : 'Record Payment'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.success }}>
              ₹{payments?.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0).toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.warning }}>
              {pendingBills.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.primary }}>
              ₹{payments?.filter(p => new Date(p.paymentDate).getMonth() === new Date().getMonth()).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0).toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {payments?.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No payments yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flat</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments?.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.flatNumber}</TableCell>
                    <TableCell>₹{payment.amount}</TableCell>
                    <TableCell className="capitalize">{payment.paymentMethod?.replace('_', ' ')}</TableCell>
                    <TableCell>{payment.transactionId || 'N/A'}</TableCell>
                    <TableCell>{new Date(payment.paymentDate).toLocaleString()}</TableCell>
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
