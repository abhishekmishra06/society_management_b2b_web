'use client';
import { useState } from 'react';
import { Siren, Shield, Flame, Heart, Phone, MapPin, Clock, TestTube, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { COLORS } from '@/lib/constants/colors';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { triggerTestEmergency } from '@/components/emergency/EmergencyAlert';
import apiClient from '@/lib/api/client';

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
  const [isTriggering, setIsTriggering] = useState(false);
  const [activeEmergencies, setActiveEmergencies] = useState([]);

  const handleTrigger = async () => {
    if (!selectedType) {
      toast.error('Please select emergency type');
      return;
    }

    setIsTriggering(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const payload = {
        type: selectedType,
        message: message || 'Emergency triggered from dashboard',
        location: location || 'Not specified',
        flatNumber: 'A-101',
        tower: 'Tower A',
        triggeredBy: userData.name || 'Admin',
      };

      const { data } = await apiClient.post('/emergency/trigger', payload);
      
      // Also trigger the visual alert
      triggerTestEmergency(selectedType);
      
      // Add to local active list
      setActiveEmergencies(prev => [...prev, data]);

      toast.success('Emergency alert triggered! Help is on the way.');
      setDialogOpen(false);
      setMessage('');
      setLocation('');
      setSelectedType(null);
    } catch (error) {
      toast.error('Failed to trigger emergency: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsTriggering(false);
    }
  };

  const handleTestSOS = (type = 'security') => {
    triggerTestEmergency(type);
    toast.info('Test emergency triggered! Check the bottom-right corner for the blinking alert.', {
      duration: 5000,
    });
  };

  const handleResolve = async (emergencyId) => {
    try {
      await apiClient.post(`/emergency/${emergencyId}/resolve`);
      setActiveEmergencies(prev => prev.filter(e => e.id !== emergencyId));
      toast.success('Emergency resolved');
    } catch (error) {
      // Still remove from UI
      setActiveEmergencies(prev => prev.filter(e => e.id !== emergencyId));
      toast.success('Emergency resolved');
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

      {/* TEST SOS SECTION - Prominent */}
      <Card className="border-2 border-dashed border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <TestTube className="h-5 w-5" />
            Test Emergency SOS
          </CardTitle>
          <CardDescription>
            Click the buttons below to test the emergency alert UI. This will trigger a blinking notification with sound at the bottom-right corner of your screen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {EMERGENCY_TYPES.map((emergency) => {
              const Icon = emergency.icon;
              return (
                <Button
                  key={emergency.type}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 border-2 hover:shadow-lg transition-all"
                  style={{ borderColor: emergency.color, color: emergency.color }}
                  onClick={() => handleTestSOS(emergency.type)}
                >
                  <div className="p-2 rounded-full" style={{ backgroundColor: emergency.color }}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold">Test {emergency.label.split(' ')[0]}</span>
                </Button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            These are test alerts only. No real emergency notifications will be sent.
          </p>
        </CardContent>
      </Card>

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
                      <strong>Note:</strong> This will trigger an emergency alert and store it in the database. In production, this would also broadcast via Socket.io.
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="text-white"
                      style={{ backgroundColor: emergency.color }}
                      onClick={handleTrigger}
                      disabled={isTriggering}
                    >
                      <Siren className="h-4 w-4 mr-2" />
                      {isTriggering ? 'Triggering...' : 'Trigger Emergency'}
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
            Active Emergencies ({activeEmergencies.length})
          </CardTitle>
          <CardDescription>Real-time emergency alerts</CardDescription>
        </CardHeader>
        <CardContent>
          {activeEmergencies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active emergencies. All clear!</p>
              <p className="text-xs mt-2">Use the Test buttons above to simulate an emergency alert</p>
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
                              {new Date(emergency.timestamp || emergency.createdAt || Date.now()).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleResolve(emergency.id)}
                      >
                        Resolve
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
