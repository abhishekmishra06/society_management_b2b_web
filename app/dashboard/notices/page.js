'use client';
import { Plus, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { COLORS } from '@/lib/constants/colors';
import { useNotices } from '@/lib/api/queries';

export default function NoticesPage() {
  const { data: notices } = useNotices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Notice Board</h1>
          <p className="text-muted-foreground mt-1">Society notices and announcements</p>
        </div>
        <Button style={{ backgroundColor: COLORS.primary }}>
          <Plus className="h-4 w-4 mr-2" />
          New Notice
        </Button>
      </div>

      <div className="grid gap-4">
        {notices?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notices yet</p>
            </CardContent>
          </Card>
        ) : (
          notices?.map((notice) => (
            <Card key={notice.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{notice.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Posted on {new Date(notice.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: COLORS.primary + '20', color: COLORS.primary }}>
                    {notice.priority || 'Normal'}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{notice.content}</p>
                {notice.attachment && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Attachment: {notice.attachment}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
