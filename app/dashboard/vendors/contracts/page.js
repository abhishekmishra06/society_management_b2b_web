'use client';
import { FileSignature } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { COLORS } from '@/lib/constants/colors';
import { useVendorContracts } from '@/lib/api/queries';

export default function VendorContractsPage() {
  const { data: contracts } = useVendorContracts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Vendor Contracts</h1>
        <p className="text-muted-foreground mt-1">Contract management and renewals</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contracts ({contracts?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {contracts?.length === 0 ? (
            <div className="text-center py-12">
              <FileSignature className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No contracts yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts?.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.vendorName}</TableCell>
                    <TableCell>{contract.serviceType}</TableCell>
                    <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(contract.expiryDate).toLocaleDateString()}</TableCell>
                    <TableCell>₹{contract.amount}</TableCell>
                    <TableCell>
                      <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                        {contract.status}
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
