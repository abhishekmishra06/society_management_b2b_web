'use client';
import { AlertOctagon, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/lib/constants/colors';
import { toast } from 'sonner';

export default function DuesPage() {
  const dummyDues = [
    { id: '1', flatNumber: 'A-101', residentName: 'John Doe', amount: 5000, dueDate: '2026-02-10', daysOverdue: 0, penalty: 0, totalDue: 5000, status: 'pending' },
    { id: '2', flatNumber: 'A-104', residentName: 'Mike Brown', amount: 5000, dueDate: '2026-01-10', daysOverdue: 37, penalty: 500, totalDue: 5500, status: 'overdue' },
    { id: '3', flatNumber: 'B-201', residentName: 'Sarah Wilson', amount: 5000, dueDate: '2025-12-10', daysOverdue: 68, penalty: 1000, totalDue: 6000, status: 'defaulter' },
  ];

  const totalPending = dummyDues.reduce((sum, d) => sum + d.totalDue, 0);
  const totalPenalty = dummyDues.reduce((sum, d) => sum + d.penalty, 0);
  const defaulters = dummyDues.filter(d => d.status === 'defaulter').length;

  const handleSendReminder = (due) => {
    toast.success(`Reminder sent to ${due.residentName}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Due & Penalty</h1>
        <p className="text-muted-foreground mt-1">Grace period, late fee %, auto penalty, defaulter list</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.error }}>₹{totalPending.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Penalties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.warning }}>₹{totalPenalty}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Defaulters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.error }}>{defaulters}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Overdue Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{dummyDues.filter(d => d.daysOverdue > 0).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pending Dues & Penalties</CardTitle>
            <div className="text-sm text-muted-foreground">
              Grace Period: 5 days | Late Fee: 10%
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flat</TableHead>
                <TableHead>Resident</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Days Overdue</TableHead>
                <TableHead>Penalty</TableHead>
                <TableHead>Total Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyDues.map((due) => (
                <TableRow key={due.id}>
                  <TableCell className="font-medium">{due.flatNumber}</TableCell>
                  <TableCell>{due.residentName}</TableCell>
                  <TableCell>₹{due.amount}</TableCell>
                  <TableCell>{new Date(due.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {due.daysOverdue > 0 ? (
                      <span className="text-red-600 font-medium">{due.daysOverdue} days</span>
                    ) : (
                      <span className="text-green-600">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {due.penalty > 0 ? (
                      <span className="text-red-600 font-medium">₹{due.penalty}</span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="font-bold">₹{due.totalDue}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={due.status === 'pending' ? 'secondary' : 'destructive'}
                      className="capitalize"
                    >
                      {due.status === 'defaulter' && <AlertOctagon className="h-3 w-3 mr-1 inline" />}
                      {due.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleSendReminder(due)}>
                      Send Reminder
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Penalty Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Grace Period</p>
              <p className="text-2xl font-bold">5 days</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Late Fee Percentage</p>
              <p className="text-2xl font-bold">10%</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Auto Penalty</p>
              <Badge variant="default">Enabled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
