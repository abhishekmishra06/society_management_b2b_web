'use client';
import { AlertTriangle, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/lib/constants/colors';
import { toast } from 'sonner';

export default function BlacklistPage() {
  const dummyBlacklist = [
    { id: '1', name: 'Suspicious Person 1', mobile: '9876543210', photo: null, reason: 'Attempted unauthorized entry', addedDate: '2026-01-15', addedBy: 'Security Head' },
    { id: '2', name: 'Unknown Person', mobile: 'Unknown', photo: null, reason: 'Theft attempt reported', addedDate: '2025-12-20', addedBy: 'Admin' },
    { id: '3', name: 'Banned Vendor', mobile: '9876543222', photo: null, reason: 'Fraudulent activity', addedDate: '2026-02-01', addedBy: 'Management' },
  ];

  const handleRemoveFromBlacklist = (person) => {
    toast.success(`${person.name} removed from blacklist`);
  };

  const handleAlert = (person) => {
    toast.error(`ALERT: ${person.name} detected at entry!`, {
      duration: 5000,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.emergency }}>Blacklist Visitor</h1>
        <p className="text-muted-foreground mt-1">Photo upload, reason, auto-alert on entry</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Blacklisted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.error }}>{dummyBlacklist.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Alerts This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: COLORS.warning }}>2</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Additions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">1</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2" style={{ borderColor: COLORS.error }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" style={{ color: COLORS.error }} />
            <CardTitle>Blacklisted Persons</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {dummyBlacklist.length === 0 ? (
            <div className="text-center py-12">
              <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No blacklisted persons</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Added Date</TableHead>
                  <TableHead>Added By</TableHead>
                  <TableHead>Photo</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyBlacklist.map((person) => (
                  <TableRow key={person.id} className="bg-red-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" style={{ color: COLORS.error }} />
                        {person.name}
                      </div>
                    </TableCell>
                    <TableCell>{person.mobile}</TableCell>
                    <TableCell className="max-w-xs">{person.reason}</TableCell>
                    <TableCell>{new Date(person.addedDate).toLocaleDateString()}</TableCell>
                    <TableCell>{person.addedBy}</TableCell>
                    <TableCell>
                      {person.photo ? (
                        <Badge variant="default">Available</Badge>
                      ) : (
                        <Badge variant="secondary">No Photo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          style={{ borderColor: COLORS.error, color: COLORS.error }}
                          onClick={() => handleAlert(person)}
                        >
                          Test Alert
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRemoveFromBlacklist(person)}
                        >
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auto-Alert System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <p className="font-medium">Facial Recognition Alert</p>
                <p className="text-sm text-muted-foreground">Automatic alert when blacklisted person detected</p>
              </div>
              <Badge style={{ backgroundColor: COLORS.success, color: 'white' }}>ACTIVE</Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div>
                <p className="font-medium">Mobile Number Check</p>
                <p className="text-sm text-muted-foreground">Cross-check mobile numbers at entry</p>
              </div>
              <Badge style={{ backgroundColor: COLORS.success, color: 'white' }}>ACTIVE</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
