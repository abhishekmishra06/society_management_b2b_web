'use client';
import { useState } from 'react';
import { Plus, Search, UserCheck, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { COLORS } from '@/lib/constants/colors';
import { useOwners } from '@/lib/api/queries';

export default function OwnersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: owners, isLoading } = useOwners();

  const filteredOwners = owners?.filter(o => 
    o.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.flatNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Owner Management</h1>
          <p className="text-muted-foreground mt-1">Manage flat owners with ownership details</p>
        </div>
        <Button style={{ backgroundColor: COLORS.primary }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Owner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Owners ({filteredOwners.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search owners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading owners...</div>
          ) : filteredOwners.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No owners found. Add residents with type "Owner" in Resident Management.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Flat</TableHead>
                  <TableHead>Tower</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ownership Since</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOwners.map((owner) => (
                  <TableRow key={owner.id}>
                    <TableCell className="font-medium">{owner.name}</TableCell>
                    <TableCell>{owner.flatNumber}</TableCell>
                    <TableCell>{owner.tower}</TableCell>
                    <TableCell>{owner.mobile}</TableCell>
                    <TableCell>{owner.email}</TableCell>
                    <TableCell>{owner.moveInDate ? new Date(owner.moveInDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="default">{owner.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
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
    </div>
  );
}
