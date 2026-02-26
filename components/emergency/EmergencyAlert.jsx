'use client';
import { useEffect, useState, useRef } from 'react';
import { getSocket } from '@/lib/socket/client';
import { AlertCircle, X, Phone, Shield, Flame, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/lib/constants/colors';
import { Badge } from '@/components/ui/badge';

const EMERGENCY_TYPES = {
  security: { icon: Shield, color: '#ef4444', label: 'Security' },
  fire: { icon: Flame, color: '#f97316', label: 'Fire' },
  medical: { icon: Heart, color: '#dc2626', label: 'Medical' },
  general: { icon: AlertCircle, color: '#f59e0b', label: 'General' },
};

export default function EmergencyAlert() {
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Listen for new emergencies
    socket.on('emergency:new', (emergency) => {
      setActiveEmergencies(prev => [...prev, emergency]);
      playAlertSound();
    });

    // Listen for resolved emergencies
    socket.on('emergency:resolved', ({ emergencyId }) => {
      setActiveEmergencies(prev => prev.filter(e => e.id !== emergencyId));
    });

    // Request current active emergencies on mount
    socket.emit('emergency:getActive');
    socket.on('emergency:active', (emergencies) => {
      setActiveEmergencies(emergencies || []);
    });

    return () => {
      socket.off('emergency:new');
      socket.off('emergency:resolved');
      socket.off('emergency:active');
    };
  }, []);

  const playAlertSound = () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    // Use browser's built-in audio or create beeps
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    setTimeout(() => {
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }, 400);
    
    setTimeout(() => {
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      setIsPlaying(false);
    }, 800);
  };

  const handleDismiss = (emergencyId) => {
    setActiveEmergencies(prev => prev.filter(e => e.id !== emergencyId));
  };

  const handleRespond = (emergency) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('emergency:respond', { emergencyId: emergency.id });
    }
  };

  if (activeEmergencies.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {activeEmergencies.map((emergency) => {
        const type = EMERGENCY_TYPES[emergency.type] || EMERGENCY_TYPES.general;
        const Icon = type.icon;
        
        return (
          <Card 
            key={emergency.id} 
            className="p-4 shadow-2xl blink-animation border-2"
            style={{ borderColor: type.color, backgroundColor: 'white' }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="p-2 rounded-full pulse-ring"
                style={{ backgroundColor: type.color }}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg" style={{ color: type.color }}>
                        {type.label} Emergency!
                      </h3>
                      <Badge variant="destructive">ACTIVE</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {emergency.location || 'Unknown Location'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDismiss(emergency.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {emergency.message && (
                  <p className="text-sm mb-3">{emergency.message}</p>
                )}
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <span>Flat: {emergency.flatNumber || 'N/A'}</span>
                  <span>•</span>
                  <span>Tower: {emergency.tower || 'N/A'}</span>
                  <span>•</span>
                  <span>{new Date(emergency.timestamp).toLocaleTimeString()}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    style={{ backgroundColor: type.color }}
                    onClick={() => handleRespond(emergency)}
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Respond
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDismiss(emergency.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
