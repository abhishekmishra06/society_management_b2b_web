'use client';
import { useState } from 'react';
import { Plus, Search, Receipt, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { useMaintenanceBills, useCreateMaintenanceBill, useFlats } from '@/lib/api/queries';
import { toast } from 'sonner';
import { generateMaintenanceBillPDF, exportCSV } from '@/lib/pdf-utils';

export default function MaintenanceBillingPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    flatNumber: '',
    amount: '',
    month: new Date().toISOString().slice(0, 7),
    dueDate: '',
    description: 'Monthly maintenance charge',
  });

  const { data: bills, isLoading } = useMaintenanceBills();
  const { data: flats } = useFlats();
  const createBill = useCreateMaintenanceBill();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBill.mutateAsync(formData);
      toast.success('Maintenance bill created!');
      setDialogOpen(false);
      setFormData({
        flatNumber: '',
        amount: '',
        month: new Date().toISOString().slice(0, 7),
        dueDate: '',
        description: 'Monthly maintenance charge',
      });
    } catch (error) {
      toast.error('Failed to create bill');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Maintenance Billing</h1>
          <p className="text-muted-foreground mt-1">Create and manage monthly maintenance bills</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            exportCSV(bills || [], [
              { key: 'flatNumber', label: 'Flat' },
              { key: 'month', label: 'Month' },
              { key: 'amount', label: 'Amount' },
              { key: 'dueDate', label: 'Due Date' },
              { key: 'status', label: 'Status' },
            ], 'MaintenanceBills');
            toast.success('Exported to CSV!');
          }}>
            <Download className="h-4 w-4 mr-2" />
            Export
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
              <DialogTitle>Create Maintenance Bill</DialogTitle>
              <DialogDescription>Generate a new maintenance bill for a flat</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Flat Number *</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.flatNumber}
                  onChange={(e) => setFormData({...formData, flatNumber: e.target.value})}
                  required
                >
                  <option value="">Select Flat</option>
                  {flats?.map(f => (
                    <option key={f.id} value={f.flatNumber}>{f.flatNumber}</option>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label>Month *</Label>
                  <Input
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={createBill.isPending}>
                  {createBill.isPending ? 'Creating...' : 'Create Bill'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Maintenance Bills ({bills?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading bills...</div>
          ) : bills?.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No bills yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flat</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Generated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills?.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.flatNumber}</TableCell>
                    <TableCell>{bill.month}</TableCell>
                    <TableCell>₹{bill.amount}</TableCell>
                    <TableCell>{new Date(bill.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={bill.status === 'paid' ? 'default' : 'destructive'}>
                        {bill.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(bill.generatedAt).toLocaleDateString()}</TableCell>
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
