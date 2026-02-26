'use client';
import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { COLORS } from '@/lib/constants/colors';
import { useAssets } from '@/lib/api/queries';

export default function AssetsPage() {
  const { data: assets } = useAssets();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Asset Management</h1>
        <p className="text-muted-foreground mt-1">Track society assets and purchases</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assets ({assets?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {assets?.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No assets recorded yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets?.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>{asset.category}</TableCell>
                    <TableCell>{new Date(asset.purchasedAt).toLocaleDateString()}</TableCell>
                    <TableCell>₹{asset.value}</TableCell>
                    <TableCell className="capitalize">{asset.condition}</TableCell>
                    <TableCell>{asset.location}</TableCell>
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
