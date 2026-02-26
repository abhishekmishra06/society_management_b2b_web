'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UsersRound } from 'lucide-react';
import { COLORS } from '@/lib/constants/colors';

export default function FamilyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Family Member Management</h1>
        <p className="text-muted-foreground mt-1">Spouse, children, parents, emergency contact</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersRound className="h-5 w-5" style={{ color: COLORS.primary }} />
            Family Members
          </CardTitle>
          <CardDescription>Coming in Phase 2</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Manage family members for each resident including relationships and emergency contacts.</p>
        </CardContent>
      </Card>
    </div>
  );
}
