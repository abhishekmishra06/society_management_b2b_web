'use client';
import { useState } from 'react';
import { Plus, Search, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { COLORS } from '@/lib/constants/colors';
import { useTenants } from '@/lib/api/queries';

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: tenants, isLoading } = useTenants();

  const filteredTenants = tenants?.filter(t => 
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.flatNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Tenant Management</h1>
          <p className="text-muted-foreground mt-1">Track rent agreements, duration, and deposits</p>
        </div>
        <Button style={{ backgroundColor: COLORS.primary }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tenant
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Tenants ({filteredTenants.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading tenants...</div>
          ) : filteredTenants.length === 0 ? (
            <div className="text-center py-12">
              <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tenants found. Add residents with type "Tenant" in Resident Management.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Flat</TableHead>
                  <TableHead>Tower</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Rent Start</TableHead>
                  <TableHead>Agreement Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>{tenant.flatNumber}</TableCell>
                    <TableCell>{tenant.tower}</TableCell>
                    <TableCell>{tenant.mobile}</TableCell>
                    <TableCell>{tenant.moveInDate ? new Date(tenant.moveInDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>12 months</TableCell>
                    <TableCell>
                      <Badge variant="default">{tenant.status}</Badge>
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
