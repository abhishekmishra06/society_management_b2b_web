'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { COLORS } from '@/lib/constants/colors';

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Security Dashboard</h1>
        <p className="text-muted-foreground mt-1">Emergency alerts, pending visitors, guard interface</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" style={{ color: COLORS.primary }} />
            Security Operations
          </CardTitle>
          <CardDescription>Coming in Phase 2</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Comprehensive security dashboard with visitor tracking and emergency response.</p>
        </CardContent>
      </Card>
    </div>
  );
}
