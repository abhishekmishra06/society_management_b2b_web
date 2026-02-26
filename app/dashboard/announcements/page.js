'use client';
import { MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { COLORS } from '@/lib/constants/colors';
import { useAnnouncements } from '@/lib/api/queries';

export default function AnnouncementsPage() {
  const { data: announcements } = useAnnouncements();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Announcements</h1>
        <p className="text-muted-foreground mt-1">Society-wide announcements</p>
      </div>

      <div className="grid gap-4">
        {announcements?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No announcements yet</p>
            </CardContent>
          </Card>
        ) : (
          announcements?.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{announcement.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(announcement.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: COLORS.primary, color: 'white' }}>
                    Important
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
