'use client';
import { DollarSign, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/lib/constants/colors';
import { toast } from 'sonner';
import { generateSalarySlipPDF, exportCSV } from '@/lib/pdf-utils';

export default function StaffSalaryPage() {
  const dummySalaries = [
    { id: '1', staffId: 'ST-001', staffName: 'Ram Kumar', role: 'security', basicSalary: 15000, bonus: 1000, deductions: 500, netSalary: 15500, month: '2026-02', status: 'paid' },
    { id: '2', staffId: 'ST-002', staffName: 'Shyam Verma', role: 'maintenance', basicSalary: 18000, bonus: 1500, deductions: 800, netSalary: 18700, month: '2026-02', status: 'paid' },
    { id: '3', staffId: 'ST-003', staffName: 'Mohan Singh', role: 'security', basicSalary: 15000, bonus: 0, deductions: 300, netSalary: 14700, month: '2026-02', status: 'pending' },
    { id: '4', staffId: 'ST-004', staffName: 'Ravi Patel', role: 'housekeeping', basicSalary: 12000, bonus: 500, deductions: 200, netSalary: 12300, month: '2026-02', status: 'pending' },
  ];

  const totalPaid = dummySalaries.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.netSalary, 0);
  const totalPending = dummySalaries.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.netSalary, 0);

  const handleGenerateSlip = (salary) => {
    try {
      generateSalarySlipPDF(salary);
      toast.success(`Salary slip for ${salary.staffName} downloaded!`);
    } catch (error) {
      toast.error('PDF generation failed: ' + error.message);
    }
  };

  const handlePaySalary = (salary) => {
    toast.success(`Salary paid to ${salary.staffName}`);
  };

  const handleExportCSV = () => {
    exportCSV(dummySalaries, [
      { key: 'staffId', label: 'Staff ID' },
      { key: 'staffName', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'basicSalary', label: 'Basic' },
      { key: 'bonus', label: 'Bonus' },
      { key: 'deductions', label: 'Deductions' },
      { key: 'netSalary', label: 'Net Salary' },
      { key: 'status', label: 'Status' },
    ], 'StaffSalary');
    toast.success('Exported to CSV!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Staff Salary Management</h1>
          <p className="text-muted-foreground mt-1">Basic/bonus/deduction, generate salary slips</p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm">Total Salaries</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">Rs. {dummySalaries.reduce((sum, s) => sum + s.netSalary, 0).toLocaleString('en-IN')}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Paid</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.success }}>Rs. {totalPaid.toLocaleString('en-IN')}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Pending</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.warning }}>Rs. {totalPending.toLocaleString('en-IN')}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Staff Count</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{dummySalaries.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Salary Records - February 2026</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Basic</TableHead>
                <TableHead>Bonus</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummySalaries.map((salary) => (
                <TableRow key={salary.id}>
                  <TableCell className="font-mono">{salary.staffId}</TableCell>
                  <TableCell className="font-medium">{salary.staffName}</TableCell>
                  <TableCell className="capitalize">{salary.role}</TableCell>
                  <TableCell>Rs. {salary.basicSalary.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-green-600">+Rs. {salary.bonus.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-red-600">-Rs. {salary.deductions.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="font-bold">Rs. {salary.netSalary.toLocaleString('en-IN')}</TableCell>
                  <TableCell><Badge variant={salary.status === 'paid' ? 'default' : 'destructive'}>{salary.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleGenerateSlip(salary)}>
                        <Download className="h-3 w-3 mr-1" />
                        Slip
                      </Button>
                      {salary.status === 'pending' && (
                        <Button size="sm" style={{ backgroundColor: COLORS.success }} className="text-white" onClick={() => handlePaySalary(salary)}>
                          <DollarSign className="h-3 w-3 mr-1" />
                          Pay
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

      <Card>
        <CardHeader><CardTitle>Salary Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2"><p className="text-sm text-muted-foreground">Total Basic Salary</p><p className="text-2xl font-bold">Rs. {dummySalaries.reduce((sum, s) => sum + s.basicSalary, 0).toLocaleString('en-IN')}</p></div>
            <div className="space-y-2"><p className="text-sm text-muted-foreground">Total Bonuses</p><p className="text-2xl font-bold" style={{ color: COLORS.success }}>Rs. {dummySalaries.reduce((sum, s) => sum + s.bonus, 0).toLocaleString('en-IN')}</p></div>
            <div className="space-y-2"><p className="text-sm text-muted-foreground">Total Deductions</p><p className="text-2xl font-bold" style={{ color: COLORS.error }}>Rs. {dummySalaries.reduce((sum, s) => sum + s.deductions, 0).toLocaleString('en-IN')}</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
