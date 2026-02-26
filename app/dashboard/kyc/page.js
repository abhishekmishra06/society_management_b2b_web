'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileCheck } from 'lucide-react';
import { COLORS } from '@/lib/constants/colors';

export default function KYCPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>KYC Verification</h1>
        <p className="text-muted-foreground mt-1">Aadhaar/PAN upload, Approve/Reject with remarks</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" style={{ color: COLORS.primary }} />
            KYC Management
          </CardTitle>
          <CardDescription>Coming in Phase 2</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This feature will include document upload, verification workflow, and approval system.</p>
        </CardContent>
      </Card>
    </div>
  );
}
