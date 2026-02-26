'use client';
import { Clock, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/lib/constants/colors';
import { useStaffAttendance, useStaff } from '@/lib/api/queries';
import { toast } from 'sonner';
import { generateReportPDF, exportCSV } from '@/lib/pdf-utils';

export default function StaffAttendancePage() {
  const { data: attendanceFromAPI } = useStaffAttendance();
  const { data: staff } = useStaff();

  const dummyAttendance = [
    { id: '1', staffId: 'ST-001', staffName: 'Ram Kumar', date: '2026-02-28', checkIn: '08:00', checkOut: '20:00', status: 'present' },
    { id: '2', staffId: 'ST-002', staffName: 'Shyam Verma', date: '2026-02-28', checkIn: '09:00', checkOut: '17:00', status: 'present' },
    { id: '3', staffId: 'ST-003', staffName: 'Mohan Singh', date: '2026-02-28', checkIn: null, checkOut: null, status: 'absent' },
    { id: '4', staffId: 'ST-004', staffName: 'Ravi Patel', date: '2026-02-28', checkIn: '09:00', checkOut: '13:00', status: 'half_day' },
    { id: '5', staffId: 'ST-001', staffName: 'Ram Kumar', date: '2026-02-27', checkIn: '08:00', checkOut: '20:00', status: 'present' },
    { id: '6', staffId: 'ST-002', staffName: 'Shyam Verma', date: '2026-02-27', checkIn: '09:00', checkOut: '17:00', status: 'present' },
  ];

  const attendance = (attendanceFromAPI && attendanceFromAPI.length > 0) ? attendanceFromAPI : dummyAttendance;
  const todayStr = '2026-02-28';
  const todayAttendance = attendance.filter(a => a.date === todayStr || (a.date && new Date(a.date).toDateString() === new Date().toDateString()));

  const handleExportPDF = () => {
    try {
      generateReportPDF('Staff Attendance Report', attendance, [
        { key: 'staffId', label: 'Staff ID' },
        { key: 'staffName', label: 'Name' },
        { key: 'date', label: 'Date' },
        { key: 'checkIn', label: 'Check In' },
        { key: 'checkOut', label: 'Check Out' },
        { key: 'status', label: 'Status' },
      ]);
      toast.success('Attendance report PDF downloaded!');
    } catch (error) {
      toast.error('PDF generation failed: ' + error.message);
    }
  };

  const handleExportCSV = () => {
    exportCSV(attendance, [
      { key: 'staffId', label: 'Staff ID' },
      { key: 'staffName', label: 'Name' },
      { key: 'date', label: 'Date' },
      { key: 'checkIn', label: 'Check In' },
      { key: 'checkOut', label: 'Check Out' },
      { key: 'status', label: 'Status' },
    ], 'StaffAttendance');
    toast.success('Exported to CSV!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Staff Attendance</h1>
          <p className="text-muted-foreground mt-1">Track daily attendance</p>
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
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm">Today Present</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.success }}>{todayAttendance.filter(a => a.status === 'present').length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Today Absent</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.error }}>{todayAttendance.filter(a => a.status === 'absent').length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Half Day</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.warning }}>{todayAttendance.filter(a => a.status === 'half_day').length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Total Staff</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{staff?.length || 4}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Attendance Records</CardTitle></CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <div className="text-center py-12"><Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No attendance records yet</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Check-In</TableHead>
                  <TableHead>Check-Out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.slice(0, 20).map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.staffId}</TableCell>
                    <TableCell className="font-medium">{record.staffName}</TableCell>
                    <TableCell>{record.date ? new Date(record.date).toLocaleDateString('en-IN') : 'N/A'}</TableCell>
                    <TableCell>{record.checkIn || '-'}</TableCell>
                    <TableCell>{record.checkOut || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === 'present' ? 'default' : record.status === 'absent' ? 'destructive' : 'secondary'}>{record.status === 'half_day' ? 'Half Day' : record.status}</Badge>
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
