'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { COLORS } from '@/lib/constants/colors';

export default function VisitorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Visitor Management</h1>
        <p className="text-muted-foreground mt-1">Entry/exit logging, approve/reject visitors</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" style={{ color: COLORS.primary }} />
            Visitor System
          </CardTitle>
          <CardDescription>Coming in Phase 2</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Track visitors with QR codes, pre-approvals, and gate pass system.</p>
        </CardContent>
      </Card>
    </div>
  );
}
