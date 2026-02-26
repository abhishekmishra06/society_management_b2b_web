'use client';
import { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, RefreshCw, Filter, Info, AlertTriangle, MessageSquare, CreditCard, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { COLORS } from '@/lib/constants/colors';
import { toast } from 'sonner';

export default function NotificationCenterPage() {
  const [notifications, setNotifications] = useState([
    { id: '1', type: 'billing', title: 'Maintenance Bill Generated', message: 'February maintenance bills have been generated for all flats.', time: '2 hours ago', read: false, icon: CreditCard },
    { id: '2', type: 'complaint', title: 'New Complaint: Water Leakage', message: 'Complaint from A-101: Water leaking from ceiling in bedroom.', time: '3 hours ago', read: false, icon: AlertTriangle },
    { id: '3', type: 'visitor', title: 'Visitor Entry: Amit Kumar', message: 'Visitor registered for Flat A-102. Purpose: Personal.', time: '5 hours ago', read: false, icon: Info },
    { id: '4', type: 'maintenance', title: 'Elevator Maintenance Scheduled', message: 'Tower A elevator service scheduled for March 2nd, 10 AM - 4 PM.', time: '1 day ago', read: true, icon: Wrench },
    { id: '5', type: 'billing', title: 'Payment Received', message: 'Rs. 5,000 received from Flat A-103 via UPI.', time: '1 day ago', read: true, icon: CreditCard },
    { id: '6', type: 'general', title: 'Society Meeting Reminder', message: 'Monthly society meeting tomorrow at 7 PM in the clubhouse.', time: '1 day ago', read: true, icon: MessageSquare },
    { id: '7', type: 'complaint', title: 'Complaint Resolved', message: 'Noise complaint from A-103 has been resolved.', time: '2 days ago', read: true, icon: Check },
    { id: '8', type: 'visitor', title: 'Guest Pre-Approved', message: 'Guest Priya Sharma pre-approved for Flat A-102 on Feb 28.', time: '2 days ago', read: true, icon: Info },
  ]);

  const [filter, setFilter] = useState('all');
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const filtered = notifications.filter(n => filter === 'all' || (filter === 'unread' && !n.read) || n.type === filter);

  const typeColors = {
    billing: COLORS.primary,
    complaint: COLORS.error,
    visitor: COLORS.success,
    maintenance: COLORS.warning,
    general: COLORS.textSecondary,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-7 w-7" style={{ color: COLORS.primary }} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{unreadCount}</span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Notification Center</h1>
            <p className="text-muted-foreground mt-1">{unreadCount} unread notifications</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
            <CheckCheck className="h-4 w-4 mr-1" />Mark All Read
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll} disabled={notifications.length === 0}>
            <Trash2 className="h-4 w-4 mr-1" />Clear All
          </Button>
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="complaint">Complaints</TabsTrigger>
          <TabsTrigger value="visitor">Visitors</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((n) => {
            const Icon = n.icon || Bell;
            const color = typeColors[n.type] || COLORS.primary;
            return (
              <Card
                key={n.id}
                className={`cursor-pointer transition-all hover:shadow-md ${!n.read ? 'border-l-4' : ''}`}
                style={!n.read ? { borderLeftColor: color } : {}}
                onClick={() => handleMarkRead(n.id)}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full" style={{ backgroundColor: color + '20' }}>
                      <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className={`text-sm ${!n.read ? 'font-bold' : 'font-medium'}`}>{n.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4 shrink-0">
                          <span className="text-xs text-muted-foreground">{n.time}</span>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}>
                            <Trash2 className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
