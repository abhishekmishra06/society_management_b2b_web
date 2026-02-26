'use client';
import { useState } from 'react';
import { Plus, Zap, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { useFlats } from '@/lib/api/queries';
import { toast } from 'sonner';
import { generateUtilityBillPDF, exportCSV } from '@/lib/pdf-utils';

export default function UtilityBillingPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    flatNumber: '',
    type: 'electricity',
    previousReading: '',
    currentReading: '',
    ratePerUnit: '6.5',
    month: new Date().toISOString().slice(0, 7),
  });

  const dummyBills = [
    { id: '1', flatNumber: 'A-101', type: 'electricity', previousReading: 1200, currentReading: 1450, units: 250, amount: 1625, month: '2026-02', status: 'pending' },
    { id: '2', flatNumber: 'A-102', type: 'water', previousReading: 450, currentReading: 520, units: 70, amount: 280, month: '2026-02', status: 'paid' },
    { id: '3', flatNumber: 'A-103', type: 'electricity', previousReading: 980, currentReading: 1180, units: 200, amount: 1300, month: '2026-02', status: 'pending' },
    { id: '4', flatNumber: 'B-201', type: 'water', previousReading: 320, currentReading: 385, units: 65, amount: 260, month: '2026-02', status: 'pending' },
    { id: '5', flatNumber: 'B-202', type: 'electricity', previousReading: 1500, currentReading: 1720, units: 220, amount: 1430, month: '2026-02', status: 'paid' },
  ];

  const { data: flats } = useFlats();
  const bills = dummyBills;

  const calculateAmount = () => {
    const units = formData.currentReading - formData.previousReading;
    return units * parseFloat(formData.ratePerUnit);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Utility bill created successfully!');
    setDialogOpen(false);
  };

  const handleDownloadPDF = (bill) => {
    try {
      generateUtilityBillPDF(bill);
      toast.success('Utility bill PDF downloaded!');
    } catch (error) {
      toast.error('PDF generation failed: ' + error.message);
    }
  };

  const handleExportCSV = () => {
    exportCSV(bills, [
      { key: 'flatNumber', label: 'Flat' },
      { key: 'type', label: 'Type' },
      { key: 'previousReading', label: 'Previous Reading' },
      { key: 'currentReading', label: 'Current Reading' },
      { key: 'units', label: 'Units' },
      { key: 'amount', label: 'Amount' },
      { key: 'month', label: 'Month' },
      { key: 'status', label: 'Status' },
    ], 'UtilityBills');
    toast.success('Exported to CSV!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Utility Billing</h1>
          <p className="text-muted-foreground mt-1">Electricity & Water billing with meter reading</p>
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
                Create Bill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Utility Bill</DialogTitle>
                <DialogDescription>Generate electricity or water bill</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Flat Number *</Label>
                    <select className="w-full p-2 border rounded-md" required value={formData.flatNumber} onChange={(e) => setFormData({...formData, flatNumber: e.target.value})}>
                      <option value="">Select Flat</option>
                      {flats?.map(f => <option key={f.id} value={f.flatNumber}>{f.flatNumber}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <select className="w-full p-2 border rounded-md" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                      <option value="electricity">Electricity</option>
                      <option value="water">Water</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Previous Reading *</Label>
                    <Input type="number" value={formData.previousReading} onChange={(e) => setFormData({...formData, previousReading: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Reading *</Label>
                    <Input type="number" value={formData.currentReading} onChange={(e) => setFormData({...formData, currentReading: e.target.value})} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rate per Unit</Label>
                    <Input type="number" step="0.1" value={formData.ratePerUnit} onChange={(e) => setFormData({...formData, ratePerUnit: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Month *</Label>
                    <Input type="month" value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} required />
                  </div>
                </div>
                {formData.previousReading && formData.currentReading && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">Units: {formData.currentReading - formData.previousReading}</p>
                    <p className="text-lg font-bold" style={{ color: COLORS.primary }}>Amount: Rs. {calculateAmount().toFixed(2)}</p>
                  </div>
                )}
                <div className="flex justify-end">
                  <Button type="submit">Create Bill</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Bills</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{bills.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Amount</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold" style={{ color: COLORS.primary }}>Rs. {bills.reduce((sum, b) => sum + b.amount, 0).toLocaleString('en-IN')}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Pending</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold" style={{ color: COLORS.warning }}>{bills.filter(b => b.status === 'pending').length}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Utility Bills ({bills.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flat</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Previous</TableHead>
                <TableHead>Current</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.flatNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {bill.type === 'electricity' ? <Zap className="h-3 w-3 mr-1 inline" /> : <TrendingUp className="h-3 w-3 mr-1 inline" />}
                      {bill.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{bill.previousReading}</TableCell>
                  <TableCell>{bill.currentReading}</TableCell>
                  <TableCell>{bill.units}</TableCell>
                  <TableCell>Rs. {bill.amount.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{bill.month}</TableCell>
                  <TableCell>
                    <Badge variant={bill.status === 'paid' ? 'default' : 'destructive'}>{bill.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(bill)}>
                      <Download className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
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
