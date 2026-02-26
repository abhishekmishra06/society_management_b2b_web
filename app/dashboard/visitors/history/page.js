'use client';
import { History, Download } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/lib/constants/colors';
import { toast } from 'sonner';
import { generateReportPDF, exportCSV } from '@/lib/pdf-utils';

export default function VisitorHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const dummyHistory = [
    { id: '1', name: 'Amit Kumar', mobile: '9876543210', flatNumber: 'A-101', purpose: 'Personal', entryTime: '2026-02-28T10:30:00', exitTime: '2026-02-28T12:45:00', status: 'exited' },
    { id: '2', name: 'Priya Sharma', mobile: '9876543211', flatNumber: 'A-102', purpose: 'Delivery', entryTime: '2026-02-28T14:15:00', exitTime: '2026-02-28T14:30:00', status: 'exited' },
    { id: '3', name: 'Raj Patel', mobile: '9876543212', flatNumber: 'B-201', purpose: 'Business', entryTime: '2026-02-28T16:00:00', exitTime: null, status: 'inside' },
    { id: '4', name: 'Sunita Verma', mobile: '9876543213', flatNumber: 'A-103', purpose: 'Personal', entryTime: '2026-02-27T11:00:00', exitTime: '2026-02-27T15:30:00', status: 'exited' },
    { id: '5', name: 'Karan Singh', mobile: '9876543214', flatNumber: 'B-202', purpose: 'Maintenance', entryTime: '2026-02-27T09:00:00', exitTime: '2026-02-27T17:00:00', status: 'exited' },
  ];

  const filteredHistory = dummyHistory.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.mobile.includes(searchQuery) || v.flatNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !dateFilter || v.entryTime.startsWith(dateFilter);
    return matchesSearch && matchesDate;
  });

  const handleExportCSV = () => {
    try {
      exportCSV(filteredHistory, [
        { key: 'name', label: 'Name' },
        { key: 'mobile', label: 'Mobile' },
        { key: 'flatNumber', label: 'Flat' },
        { key: 'purpose', label: 'Purpose' },
        { key: 'entryTime', label: 'Entry Time' },
        { key: 'exitTime', label: 'Exit Time' },
        { key: 'status', label: 'Status' },
      ], 'VisitorHistory');
      toast.success('Visitor history exported to CSV!');
    } catch (error) {
      toast.error('Export failed: ' + error.message);
    }
  };

  const handleExportPDF = () => {
    try {
      generateReportPDF('Visitor History Report', filteredHistory, [
        { key: 'name', label: 'Name' },
        { key: 'mobile', label: 'Mobile' },
        { key: 'flatNumber', label: 'Flat' },
        { key: 'purpose', label: 'Purpose' },
        { key: 'entryTime', label: 'Entry' },
        { key: 'status', label: 'Status' },
      ]);
      toast.success('Visitor history PDF downloaded!');
    } catch (error) {
      toast.error('PDF generation failed: ' + error.message);
    }
  };

  const calculateDuration = (entry, exit) => {
    if (!exit) return 'In progress';
    const diff = new Date(exit) - new Date(entry);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Visitor History & Logs</h1>
        <p className="text-muted-foreground mt-1">Searchable logs, date filter, export CSV/PDF</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm">Total Visitors</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{dummyHistory.length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Today</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.primary }}>{dummyHistory.filter(v => v.entryTime.startsWith('2026-02-28')).length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Currently Inside</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold" style={{ color: COLORS.success }}>{dummyHistory.filter(v => v.status === 'inside').length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Avg Duration</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">2.5h</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Visitor Logs</CardTitle>
            <div className="flex gap-2">
              <Input placeholder="Search name, mobile, flat..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64" />
              <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-40" />
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Flat</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Entry Time</TableHead>
                <TableHead>Exit Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((visitor) => (
                <TableRow key={visitor.id}>
                  <TableCell className="font-medium">{visitor.name}</TableCell>
                  <TableCell>{visitor.mobile}</TableCell>
                  <TableCell>{visitor.flatNumber}</TableCell>
                  <TableCell>{visitor.purpose}</TableCell>
                  <TableCell>{new Date(visitor.entryTime).toLocaleString('en-IN')}</TableCell>
                  <TableCell>{visitor.exitTime ? new Date(visitor.exitTime).toLocaleString('en-IN') : '-'}</TableCell>
                  <TableCell>{calculateDuration(visitor.entryTime, visitor.exitTime)}</TableCell>
                  <TableCell><Badge variant={visitor.status === 'inside' ? 'default' : 'secondary'}>{visitor.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
