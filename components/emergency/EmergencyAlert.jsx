'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { AlertCircle, X, Phone, Shield, Flame, Heart, Siren } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const EMERGENCY_TYPES = {
  security: { icon: Shield, color: '#ef4444', label: 'Security' },
  fire: { icon: Flame, color: '#f97316', label: 'Fire' },
  medical: { icon: Heart, color: '#dc2626', label: 'Medical' },
  general: { icon: AlertCircle, color: '#f59e0b', label: 'General' },
};

// Global event bus for triggering test emergencies from anywhere
if (typeof window !== 'undefined') {
  window.__emergencyBus = window.__emergencyBus || {
    listeners: [],
    subscribe(fn) { this.listeners.push(fn); return () => { this.listeners = this.listeners.filter(l => l !== fn); }; },
    emit(data) { this.listeners.forEach(fn => fn(data)); },
  };
}

export function triggerTestEmergency(type = 'security') {
  if (typeof window !== 'undefined' && window.__emergencyBus) {
    const types = ['security', 'fire', 'medical', 'general'];
    const selectedType = types.includes(type) ? type : 'security';
    window.__emergencyBus.emit({
      id: `test-${Date.now()}`,
      type: selectedType,
      location: 'Tower A, 5th Floor, Flat A-501',
      message: 'This is a TEST emergency alert. No real emergency.',
      flatNumber: 'A-501',
      tower: 'Tower A',
      triggeredBy: 'System Test',
      timestamp: new Date().toISOString(),
    });
  }
}

export default function EmergencyAlert() {
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const audioContextRef = useRef(null);

  // Subscribe to test emergency events
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const unsubscribe = window.__emergencyBus.subscribe((emergency) => {
      setActiveEmergencies(prev => [...prev, emergency]);
      playAlertSound();
    });
    return unsubscribe;
  }, []);

  const playAlertSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = ctx;

      const playBeep = (startTime, freq, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      // Play siren-like pattern: high-low-high
      const now = ctx.currentTime;
      playBeep(now, 880, 0.2);
      playBeep(now + 0.25, 660, 0.2);
      playBeep(now + 0.5, 880, 0.2);
      playBeep(now + 0.75, 660, 0.2);
      playBeep(now + 1.0, 880, 0.3);
    } catch (err) {
      console.warn('Audio playback failed:', err);
    }
  }, []);

  const handleDismiss = (emergencyId) => {
    setActiveEmergencies(prev => prev.filter(e => e.id !== emergencyId));
  };

  const handleRespond = (emergency) => {
    handleDismiss(emergency.id);
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
                  <span>&#8226;</span>
                  <span>Tower: {emergency.tower || 'N/A'}</span>
                  <span>&#8226;</span>
                  <span>{new Date(emergency.timestamp).toLocaleTimeString()}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="text-white"
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
