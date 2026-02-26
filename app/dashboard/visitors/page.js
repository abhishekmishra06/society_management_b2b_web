'use client';
import { Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { COLORS } from '@/lib/constants/colors';
import { useVisitors } from '@/lib/api/queries';

export default function VisitorsMainPage() {
  const { data: visitors } = useVisitors();
  const todayVisitors = visitors?.filter(v => new Date(v.entryTime).toDateString() === new Date().toDateString()) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Visitor Management</h1>
          <p className="text-muted-foreground mt-1">Track visitor entry and exit</p>
        </div>
        <Button style={{ backgroundColor: COLORS.primary }}>
          <Plus className="h-4 w-4 mr-2" />
          Register Visitor
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Today's Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.primary }}>
              {todayVisitors.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Currently Inside</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.success }}>
              {visitors?.filter(v => v.status === 'approved' && !v.exitTime).length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.warning }}>
              {visitors?.filter(v => v.status === 'pending').length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Visitors</CardTitle>
        </CardHeader>
        <CardContent>
          {visitors?.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No visitors yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Visiting Flat</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Entry Time</TableHead>
                  <TableHead>Exit Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors?.slice(0, 10).map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell className="font-medium">{visitor.name}</TableCell>
                    <TableCell>{visitor.mobile}</TableCell>
                    <TableCell>{visitor.flatNumber}</TableCell>
                    <TableCell>{visitor.purpose}</TableCell>
                    <TableCell>{new Date(visitor.entryTime).toLocaleString()}</TableCell>
                    <TableCell>{visitor.exitTime ? new Date(visitor.exitTime).toLocaleString() : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={visitor.status === 'approved' ? 'default' : visitor.status === 'pending' ? 'secondary' : 'outline'}>
                        {visitor.status}
                      </Badge>
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
