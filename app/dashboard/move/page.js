'use client';
import { Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { COLORS } from '@/lib/constants/colors';
import { useMoveRequests } from '@/lib/api/queries';

export default function MovePage() {
  const { data: moveRequests } = useMoveRequests();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Move-In/Move-Out</h1>
        <p className="text-muted-foreground mt-1">Manage move requests and scheduling</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{moveRequests?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.warning }}>
              {moveRequests?.filter(m => m.status === 'pending').length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.success }}>
              {moveRequests?.filter(m => m.status === 'completed').length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Move Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {moveRequests?.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No move requests yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Resident</TableHead>
                  <TableHead>Flat</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Vehicle Details</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moveRequests?.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Badge variant={request.type === 'move_in' ? 'default' : 'secondary'}>
                        {request.type === 'move_in' ? 'Move-In' : 'Move-Out'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{request.residentName}</TableCell>
                    <TableCell>{request.flatNumber}</TableCell>
                    <TableCell>{new Date(request.scheduledDate).toLocaleDateString()}</TableCell>
                    <TableCell>{request.vehicleDetails || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={request.status === 'completed' ? 'default' : request.status === 'approved' ? 'secondary' : 'outline'}>
                        {request.status}
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
