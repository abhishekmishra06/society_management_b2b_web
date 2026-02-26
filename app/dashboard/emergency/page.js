'use client';
import { useState } from 'react';
import { Siren, Shield, Flame, Heart, Phone, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { COLORS } from '@/lib/constants/colors';
import { useTriggerEmergency, useActiveEmergencies } from '@/lib/api/queries';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const EMERGENCY_TYPES = [
  {
    type: 'security',
    icon: Shield,
    label: 'Security Emergency',
    color: '#ef4444',
    description: 'Suspicious activity, theft, or security threat',
  },
  {
    type: 'fire',
    icon: Flame,
    label: 'Fire Emergency',
    color: '#f97316',
    description: 'Fire outbreak or smoke detection',
  },
  {
    type: 'medical',
    icon: Heart,
    label: 'Medical Emergency',
    color: '#dc2626',
    description: 'Medical assistance required urgently',
  },
  {
    type: 'general',
    icon: Siren,
    label: 'General Emergency',
    color: '#f59e0b',
    description: 'Other urgent situations',
  },
];

export default function EmergencyPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState('');

  const triggerEmergency = useTriggerEmergency();
  const { data: activeEmergencies } = useActiveEmergencies();

  const handleTrigger = async () => {
    if (!selectedType) {
      toast.error('Please select emergency type');
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const flatNumber = 'A-101'; // Demo - should come from user data
      const tower = 'Tower A'; // Demo - should come from selected tower

      await triggerEmergency.mutateAsync({
        type: selectedType,
        message,
        location,
        flatNumber,
        tower,
        triggeredBy: userData.name || 'Unknown',
      });

      toast.success('Emergency alert triggered! Help is on the way.');
      setDialogOpen(false);
      setMessage('');
      setLocation('');
      setSelectedType(null);
    } catch (error) {
      toast.error('Failed to trigger emergency');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: COLORS.emergency }}>Emergency SOS</h1>
          <p className="text-muted-foreground mt-1">Trigger emergency alerts with real-time notifications</p>
        </div>
      </div>

      {/* Quick Trigger Buttons */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {EMERGENCY_TYPES.map((emergency) => {
          const Icon = emergency.icon;
          return (
            <Dialog key={emergency.type} open={dialogOpen && selectedType === emergency.type} onOpenChange={(open) => {
              setDialogOpen(open);
              if (open) setSelectedType(emergency.type);
            }}>
              <DialogTrigger asChild>
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2" 
                  style={{ borderColor: emergency.color }}
                  onClick={() => setSelectedType(emergency.type)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full" style={{ backgroundColor: emergency.color }}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{emergency.label}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{emergency.description}</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" style={{ color: emergency.color }} />
                    {emergency.label}
                  </DialogTitle>
                  <DialogDescription>
                    This will send real-time alerts to security and management
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location/Flat</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        id="location"
                        className="w-full pl-10 p-2 border rounded-md"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Flat A-101, 5th Floor"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Additional Details</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe the situation..."
                      rows={4}
                    />
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> This will trigger immediate alerts via Socket.io to all security personnel and management.
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      style={{ backgroundColor: emergency.color }}
                      onClick={handleTrigger}
                      disabled={triggerEmergency.isPending}
                    >
                      <Siren className="h-4 w-4 mr-2" />
                      {triggerEmergency.isPending ? 'Triggering...' : 'Trigger Emergency'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>

      {/* Active Emergencies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Siren className="h-5 w-5" style={{ color: COLORS.emergency }} />
            Active Emergencies ({activeEmergencies?.length || 0})
          </CardTitle>
          <CardDescription>Real-time emergency alerts (Socket.io powered)</CardDescription>
        </CardHeader>
        <CardContent>
          {!activeEmergencies || activeEmergencies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active emergencies. All clear!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeEmergencies.map((emergency) => {
                const typeInfo = EMERGENCY_TYPES.find(t => t.type === emergency.type) || EMERGENCY_TYPES[3];
                const Icon = typeInfo.icon;
                return (
                  <div key={emergency.id} className="p-4 border-2 rounded-lg" style={{ borderColor: typeInfo.color }}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-full" style={{ backgroundColor: typeInfo.color }}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{typeInfo.label}</h3>
                            <Badge variant="destructive">ACTIVE</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {emergency.location || 'Location not specified'}
                          </p>
                          {emergency.message && (
                            <p className="text-sm mb-2">{emergency.message}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Flat: {emergency.flatNumber}</span>
                            <span>Tower: {emergency.tower}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(emergency.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" style={{ backgroundColor: typeInfo.color }}>
                        <Phone className="h-3 w-3 mr-1" />
                        Respond
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
