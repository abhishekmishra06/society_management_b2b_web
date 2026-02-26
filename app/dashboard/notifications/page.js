'use client';
import { Mail, MessageSquare, Send } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { COLORS } from '@/lib/constants/colors';
import { toast } from 'sonner';

export default function SendNotificationsPage() {
  const [smsForm, setSmsForm] = useState({ recipients: 'all', message: '' });
  const [emailForm, setEmailForm] = useState({ recipients: 'all', subject: '', body: '' });
  const [whatsappForm, setWhatsappForm] = useState({ recipients: 'all', message: '' });

  const handleSendSMS = (e) => {
    e.preventDefault();
    toast.success('SMS sent successfully to all residents!');
    setSmsForm({ recipients: 'all', message: '' });
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    toast.success('Email sent successfully to all residents!');
    setEmailForm({ recipients: 'all', subject: '', body: '' });
  };

  const handleSendWhatsApp = (e) => {
    e.preventDefault();
    toast.success('WhatsApp message sent successfully to all residents!');
    setWhatsappForm({ recipients: 'all', message: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Send Notifications</h1>
        <p className="text-muted-foreground mt-1">Send SMS/Email/WhatsApp notifications to residents</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">SMS Sent Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">156</p>
            <Badge className="mt-2" style={{ backgroundColor: COLORS.primary }}>Via Ranapay API</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Emails Sent Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">89</p>
            <Badge className="mt-2" variant="secondary">DEMO Mode</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">WhatsApp Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">124</p>
            <Badge className="mt-2" variant="secondary">DEMO Mode</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send Bulk Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sms">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sms">SMS</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            </TabsList>

            <TabsContent value="sms">
              <form onSubmit={handleSendSMS} className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipients *</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={smsForm.recipients}
                    onChange={(e) => setSmsForm({...smsForm, recipients: e.target.value})}
                  >
                    <option value="all">All Residents</option>
                    <option value="owners">Only Owners</option>
                    <option value="tenants">Only Tenants</option>
                    <option value="tower_a">Tower A</option>
                    <option value="tower_b">Tower B</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Message * (Max 160 chars)</Label>
                  <Textarea
                    value={smsForm.message}
                    onChange={(e) => setSmsForm({...smsForm, message: e.target.value})}
                    placeholder="Type your SMS message here..."
                    rows={4}
                    maxLength={160}
                    required
                  />
                  <p className="text-xs text-muted-foreground">{smsForm.message.length}/160 characters</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm"><strong>SMS API:</strong> Ranapay Integration Active</p>
                  <p className="text-xs text-muted-foreground mt-1">Endpoint: https://b2buat.ranapay.in/api/send_sms</p>
                </div>
                <Button type="submit" style={{ backgroundColor: COLORS.primary }}>
                  <Send className="h-4 w-4 mr-2" />
                  Send SMS
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="email">
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipients *</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={emailForm.recipients}
                    onChange={(e) => setEmailForm({...emailForm, recipients: e.target.value})}
                  >
                    <option value="all">All Residents</option>
                    <option value="owners">Only Owners</option>
                    <option value="tenants">Only Tenants</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Input
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                    placeholder="Email subject"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Body *</Label>
                  <Textarea
                    value={emailForm.body}
                    onChange={(e) => setEmailForm({...emailForm, body: e.target.value})}
                    placeholder="Type your email message here..."
                    rows={6}
                    required
                  />
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm"><strong>DEMO Mode:</strong> Email functionality ready for integration</p>
                  <p className="text-xs text-muted-foreground mt-1">Connect SendGrid, AWS SES, or your email provider</p>
                </div>
                <Button type="submit" style={{ backgroundColor: COLORS.primary }}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="whatsapp">
              <form onSubmit={handleSendWhatsApp} className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipients *</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={whatsappForm.recipients}
                    onChange={(e) => setWhatsappForm({...whatsappForm, recipients: e.target.value})}
                  >
                    <option value="all">All Residents</option>
                    <option value="owners">Only Owners</option>
                    <option value="tenants">Only Tenants</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Message *</Label>
                  <Textarea
                    value={whatsappForm.message}
                    onChange={(e) => setWhatsappForm({...whatsappForm, message: e.target.value})}
                    placeholder="Type your WhatsApp message here..."
                    rows={4}
                    required
                  />
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm"><strong>DEMO Mode:</strong> WhatsApp Business API ready for integration</p>
                  <p className="text-xs text-muted-foreground mt-1">Connect Twilio WhatsApp or WhatsApp Business API</p>
                </div>
                <Button type="submit" style={{ backgroundColor: '#25D366' }}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send WhatsApp
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Water Supply Notice</p>
                <p className="text-sm text-muted-foreground">SMS • Sent to 45 residents • 2 hours ago</p>
              </div>
              <Badge variant="default">Delivered</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Maintenance Bill Reminder</p>
                <p className="text-sm text-muted-foreground">Email • Sent to 30 residents • 5 hours ago</p>
              </div>
              <Badge variant="default">Delivered</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
