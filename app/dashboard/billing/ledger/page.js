'use client';
import { FileStack, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/lib/constants/colors';
import { useLedger } from '@/lib/api/queries';
import { toast } from 'sonner';
import { generateReportPDF, exportCSV } from '@/lib/pdf-utils';

export default function LedgerPage() {
  const { data: ledgerFromAPI } = useLedger();

  const dummyLedger = [
    { id: '1', date: '2026-02-01', type: 'income', category: 'Maintenance', description: 'Feb maintenance - A Block', debit: 0, credit: 75000, balance: 175000 },
    { id: '2', date: '2026-02-03', type: 'expense', category: 'Staff', description: 'Security staff salary', debit: 30000, credit: 0, balance: 145000 },
    { id: '3', date: '2026-02-05', type: 'income', category: 'Utility', description: 'Feb utility collection', debit: 0, credit: 35000, balance: 180000 },
    { id: '4', date: '2026-02-08', type: 'expense', category: 'Maintenance', description: 'Elevator maintenance', debit: 15000, credit: 0, balance: 165000 },
    { id: '5', date: '2026-02-10', type: 'income', category: 'Penalty', description: 'Late payment penalties', debit: 0, credit: 5000, balance: 170000 },
    { id: '6', date: '2026-02-12', type: 'expense', category: 'Utilities', description: 'Common area electricity', debit: 8500, credit: 0, balance: 161500 },
  ];

  const ledger = (ledgerFromAPI && ledgerFromAPI.length > 0) ? ledgerFromAPI : dummyLedger;

  const handleExportPDF = () => {
    generateReportPDF('Accounting Ledger', ledger, [
      { key: 'date', label: 'Date' },
      { key: 'type', label: 'Type' },
      { key: 'category', label: 'Category' },
      { key: 'description', label: 'Description' },
      { key: 'debit', label: 'Debit' },
      { key: 'credit', label: 'Credit' },
      { key: 'balance', label: 'Balance' },
    ]);
    toast.success('Ledger PDF downloaded!');
  };

  const handleExportCSV = () => {
    exportCSV(ledger, [
      { key: 'date', label: 'Date' },
      { key: 'type', label: 'Type' },
      { key: 'category', label: 'Category' },
      { key: 'description', label: 'Description' },
      { key: 'debit', label: 'Debit' },
      { key: 'credit', label: 'Credit' },
      { key: 'balance', label: 'Balance' },
    ], 'Ledger');
    toast.success('Exported to CSV!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Accounting Ledger</h1>
          <p className="text-muted-foreground mt-1">Complete transaction history</p>
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

      <Card>
        <CardHeader><CardTitle>Ledger Entries</CardTitle></CardHeader>
        <CardContent>
          {ledger.length === 0 ? (
            <div className="text-center py-12">
              <FileStack className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No ledger entries yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Debit</TableHead>
                  <TableHead>Credit</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.date).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>
                      <Badge variant={entry.type === 'income' ? 'default' : 'secondary'}>{entry.type}</Badge>
                    </TableCell>
                    <TableCell>{entry.category}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="text-red-600">{entry.debit ? 'Rs. ' + Number(entry.debit).toLocaleString('en-IN') : '-'}</TableCell>
                    <TableCell className="text-green-600">{entry.credit ? 'Rs. ' + Number(entry.credit).toLocaleString('en-IN') : '-'}</TableCell>
                    <TableCell className="font-medium">Rs. {Number(entry.balance).toLocaleString('en-IN')}</TableCell>
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
