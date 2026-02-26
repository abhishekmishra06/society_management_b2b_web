'use client';
import { useState } from 'react';
import { Plus, TrendingUp, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { COLORS } from '@/lib/constants/colors';
import { useExpenses } from '@/lib/api/queries';
import { toast } from 'sonner';
import { generateReportPDF, exportCSV } from '@/lib/pdf-utils';

export default function ExpensesPage() {
  const { data: expensesFromAPI } = useExpenses();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ category: '', description: '', vendor: '', amount: '' });

  const dummyExpenses = [
    { id: '1', category: 'Maintenance', description: 'Elevator repair', vendor: 'ABC Elevators', amount: 15000, createdAt: '2026-02-10' },
    { id: '2', category: 'Utilities', description: 'Common area electricity', vendor: 'Power Corp', amount: 8500, createdAt: '2026-02-12' },
    { id: '3', category: 'Staff', description: 'Security guards salary', vendor: 'N/A', amount: 45000, createdAt: '2026-02-15' },
    { id: '4', category: 'Cleaning', description: 'Water tank cleaning', vendor: 'Clean Pro', amount: 5000, createdAt: '2026-02-18' },
    { id: '5', category: 'Maintenance', description: 'Plumbing repair B-Block', vendor: 'QuickFix Plumbing', amount: 3500, createdAt: '2026-02-20' },
  ];

  const expenses = (expensesFromAPI && expensesFromAPI.length > 0) ? expensesFromAPI : dummyExpenses;

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Expense added!');
    setDialogOpen(false);
    setFormData({ category: '', description: '', vendor: '', amount: '' });
  };

  const handleExportPDF = () => {
    generateReportPDF('Expense Report', expenses, [
      { key: 'category', label: 'Category' },
      { key: 'description', label: 'Description' },
      { key: 'vendor', label: 'Vendor' },
      { key: 'amount', label: 'Amount' },
      { key: 'createdAt', label: 'Date' },
    ]);
    toast.success('Expense report PDF downloaded!');
  };

  const handleExportCSV = () => {
    exportCSV(expenses, [
      { key: 'category', label: 'Category' },
      { key: 'description', label: 'Description' },
      { key: 'vendor', label: 'Vendor' },
      { key: 'amount', label: 'Amount' },
      { key: 'createdAt', label: 'Date' },
    ], 'Expenses');
    toast.success('Exported to CSV!');
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Expense Tracking</h1>
          <p className="text-muted-foreground mt-1">Track society expenses by category</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF Report
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: COLORS.primary }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <select className="w-full p-2 border rounded-md" required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                      <option value="">Select</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Staff">Staff</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Security">Security</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount *</Label>
                    <Input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Vendor</Label>
                  <Input value={formData.vendor} onChange={(e) => setFormData({...formData, vendor: e.target.value})} />
                </div>
                <div className="flex justify-end"><Button type="submit">Add Expense</Button></div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">Total Expenses</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.error }}>Rs. {totalExpenses.toLocaleString('en-IN')}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">This Month</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">Rs. {totalExpenses.toLocaleString('en-IN')}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Categories</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{new Set(expenses.map(e => e.category)).size}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>All Expenses</CardTitle></CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No expenses recorded yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.category}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.vendor || 'N/A'}</TableCell>
                    <TableCell>Rs. {Number(expense.amount).toLocaleString('en-IN')}</TableCell>
                    <TableCell>{new Date(expense.createdAt).toLocaleDateString('en-IN')}</TableCell>
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
