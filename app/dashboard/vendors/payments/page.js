'use client';
import { useState } from 'react';
import { DollarSign, FileText, Plus, RefreshCw, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { useVendorPayments, useCreateVendorPayment, useVendors } from '@/lib/api/queries';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { generateVendorPaymentReceiptPDF } from '@/lib/pdf-utils';

export default function VendorPaymentsPage() {
  const queryClient = useQueryClient();
  const { data: paymentsFromAPI, isLoading } = useVendorPayments();
  const { data: vendors } = useVendors();
  const createPayment = useCreateVendorPayment();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    vendorName: '', serviceType: '', amount: '', invoiceNumber: '', paymentMethod: 'Bank Transfer', status: 'pending'
  });
  const [payForm, setPayForm] = useState({ paymentMethod: 'Bank Transfer' });
  const [errors, setErrors] = useState({});

  const payments = paymentsFromAPI || [];

  const totalPaid = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.vendorName.trim()) newErrors.vendorName = 'Vendor name is required';
    if (!formData.amount || isNaN(formData.amount)) newErrors.amount = 'Valid amount is required';
    if (!formData.invoiceNumber.trim()) newErrors.invoiceNumber = 'Invoice number is required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    try {
      await createPayment.mutateAsync({
        ...formData,
        amount: Number(formData.amount),
        paymentDate: formData.status === 'completed' ? new Date().toISOString() : null,
      });
      toast.success('Payment record created!');
      setDialogOpen(false);
      setFormData({ vendorName: '', serviceType: '', amount: '', invoiceNumber: '', paymentMethod: 'Bank Transfer', status: 'pending' });
      setErrors({});
    } catch (error) {
      toast.error('Failed to create payment');
    }
  };

  const handlePayNow = (payment) => {
    setSelectedPayment(payment);
    setPayForm({ paymentMethod: 'Bank Transfer' });
    setPayDialogOpen(true);
  };

  const handleConfirmPay = async () => {
    if (!selectedPayment) return;
    try {
      await createPayment.mutateAsync({
        ...selectedPayment,
        status: 'completed',
        paymentMethod: payForm.paymentMethod,
        paymentDate: new Date().toISOString(),
      });
      toast.success(`Payment of ₹${Number(selectedPayment.amount).toLocaleString()} completed for ${selectedPayment.vendorName}`);
      setPayDialogOpen(false);
      setSelectedPayment(null);
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  const handleDownloadReceipt = (payment) => {
    try {
      generateVendorPaymentReceiptPDF(payment);
      toast.success(`Receipt downloaded for ${payment.vendorName}`);
    } catch (error) {
      toast.error('Failed to generate receipt');
    }
  };

  const filtered = payments.filter(p => {
    const q = searchQuery.toLowerCase();
    return (p.vendorName || '').toLowerCase().includes(q) || (p.serviceType || '').toLowerCase().includes(q) || (p.invoiceNumber || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Vendor Payments</h1>
          <p className="text-muted-foreground mt-1">Payment records, invoice tracking, receipt PDF</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => queryClient.invalidateQueries()}><RefreshCw className="h-4 w-4" /></Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: COLORS.primary }} className="text-white"><Plus className="h-4 w-4 mr-2" />Add Payment</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Record Vendor Payment</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Vendor Name *</Label>
                  <select className="w-full p-2 border rounded-md" value={formData.vendorName} onChange={(e) => { const v = vendors?.find(v => v.companyName === e.target.value); setFormData({...formData, vendorName: e.target.value, serviceType: v?.serviceType || formData.serviceType}); setErrors({...errors, vendorName: null}); }}>
                    <option value="">Select vendor</option>
                    {vendors?.map(v => <option key={v.id} value={v.companyName}>{v.companyName}</option>)}
                  </select>
                  {errors.vendorName && <p className="text-xs text-red-500">{errors.vendorName}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Service Type</Label>
                    <Input placeholder="e.g., Housekeeping" value={formData.serviceType} onChange={(e) => setFormData({...formData, serviceType: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Invoice No *</Label>
                    <Input placeholder="INV-2026-XXX" value={formData.invoiceNumber} onChange={(e) => { setFormData({...formData, invoiceNumber: e.target.value}); setErrors({...errors, invoiceNumber: null}); }} className={errors.invoiceNumber ? 'border-red-500' : ''} />
                    {errors.invoiceNumber && <p className="text-xs text-red-500">{errors.invoiceNumber}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount (₹) *</Label>
                    <Input type="number" placeholder="25000" value={formData.amount} onChange={(e) => { setFormData({...formData, amount: e.target.value}); setErrors({...errors, amount: null}); }} className={errors.amount ? 'border-red-500' : ''} />
                    {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <select className="w-full p-2 border rounded-md" value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select className="w-full p-2 border rounded-md" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createPayment.isPending} style={{ backgroundColor: COLORS.primary }} className="text-white">{createPayment.isPending ? 'Saving...' : 'Save Payment'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm">Total Payments</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">₹{(totalPaid + totalPending).toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Paid</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.success }}>₹{totalPaid.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Pending</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.error }}>₹{totalPending.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Total Records</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{payments.length}</p></CardContent></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search payments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      <Card>
        <CardHeader><CardTitle>Payment Records</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No payment records yet</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Add Payment" to record your first vendor payment</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
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
                {filtered.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.vendorName}</TableCell>
                    <TableCell>{payment.serviceType || '-'}</TableCell>
                    <TableCell className="font-mono text-xs">{payment.invoiceNumber || '-'}</TableCell>
                    <TableCell className="font-bold">₹{Number(payment.amount || 0).toLocaleString()}</TableCell>
                    <TableCell className="capitalize">{payment.paymentMethod || '-'}</TableCell>
                    <TableCell>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'completed' ? 'default' : 'destructive'}>{payment.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {payment.status === 'completed' && (
                          <Button size="sm" variant="outline" onClick={() => handleDownloadReceipt(payment)}>
                            <FileText className="h-3 w-3 mr-1" />Receipt
                          </Button>
                        )}
                        {payment.status === 'pending' && (
                          <Button size="sm" style={{ backgroundColor: COLORS.primary }} className="text-white" onClick={() => handlePayNow(payment)}>
                            <DollarSign className="h-3 w-3 mr-1" />Pay Now
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pay Now Dialog */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Payment</DialogTitle></DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p><span className="font-medium">Vendor:</span> {selectedPayment.vendorName}</p>
                <p><span className="font-medium">Service:</span> {selectedPayment.serviceType || 'N/A'}</p>
                <p><span className="font-medium">Invoice:</span> {selectedPayment.invoiceNumber || 'N/A'}</p>
                <p className="text-xl font-bold" style={{ color: COLORS.primary }}>Amount: ₹{Number(selectedPayment.amount || 0).toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <select className="w-full p-2 border rounded-md" value={payForm.paymentMethod} onChange={(e) => setPayForm({...payForm, paymentMethod: e.target.value})}>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPayDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleConfirmPay} disabled={createPayment.isPending} style={{ backgroundColor: COLORS.success }} className="text-white">
                  {createPayment.isPending ? 'Processing...' : 'Confirm Payment'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
