'use client';
import { useState, useEffect } from 'react';
import { Building2, Users, Receipt, Shield, Briefcase, MessageSquare, AlertCircle, Dumbbell, ParkingCircle, X, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/lib/constants/colors';

const GUIDE_STEPS = [
  {
    title: 'Welcome to MyTower!',
    description: 'Your all-in-one society management platform. Let us give you a quick tour of the key features.',
    icon: Building2,
    color: COLORS.primary,
  },
  {
    title: 'Resident Management',
    description: 'Manage residents, owners, tenants, family members, flats & towers, vehicles, and KYC verification all in one place.',
    icon: Users,
    color: '#3b82f6',
  },
  {
    title: 'Billing & Finance',
    description: 'Handle maintenance bills, utility billing, payment collection, receipts, dues, expenses, ledger, and financial reports.',
    icon: Receipt,
    color: '#10b981',
  },
  {
    title: 'Security & Visitors',
    description: 'Visitor management, guest pre-approval, gate passes, material exit passes, security dashboard, and Emergency SOS.',
    icon: Shield,
    color: '#f59e0b',
  },
  {
    title: 'Staff & Vendors',
    description: 'Manage staff, attendance, salary, vendors, contracts, and payments. Share access with staff for limited control.',
    icon: Briefcase,
    color: '#8b5cf6',
  },
  {
    title: 'Communication',
    description: 'Notice board, notifications, announcements - keep your community informed and connected.',
    icon: MessageSquare,
    color: '#06b6d4',
  },
  {
    title: 'Complaints & Facilities',
    description: 'Track complaints, book facilities like clubhouse and pool, manage society assets.',
    icon: AlertCircle,
    color: '#ef4444',
  },
  {
    title: 'Parking & Move Management',
    description: 'Manage parking slots, move-in/move-out requests, and society documents. Full CRUD with filters.',
    icon: ParkingCircle,
    color: '#14b8a6',
  },
];

export default function WelcomeGuide({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = GUIDE_STEPS[currentStep];
  const StepIcon = step.icon;
  const isLast = currentStep === GUIDE_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('welcomeGuideSeen', 'true');
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('welcomeGuideSeen', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header with gradient */}
        <div className="relative p-8 text-center" style={{ background: `linear-gradient(135deg, ${step.color}15, ${step.color}30)` }}>
          <button onClick={handleSkip} className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/50 transition">
            <X className="h-5 w-5 text-gray-500" />
          </button>
          <div className="inline-flex p-4 rounded-2xl mb-4" style={{ backgroundColor: step.color + '20' }}>
            <StepIcon className="h-10 w-10" style={{ color: step.color }} />
          </div>
          {currentStep === 0 && (
            <div className="flex items-center justify-center gap-1 mb-2">
              <Sparkles className="h-4 w-4" style={{ color: COLORS.primary }} />
              <span className="text-sm font-medium" style={{ color: COLORS.primary }}>First Time Setup</span>
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-center leading-relaxed">{step.description}</p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {GUIDE_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className="h-2 rounded-full transition-all"
                style={{
                  width: idx === currentStep ? '24px' : '8px',
                  backgroundColor: idx === currentStep ? step.color : '#e5e7eb',
                }}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6">
            <Button variant="ghost" size="sm" onClick={handleSkip} className="text-gray-400">
              Skip Tour
            </Button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={() => setCurrentStep(prev => prev - 1)}>
                  Back
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className="text-white"
                style={{ backgroundColor: step.color }}
              >
                {isLast ? 'Get Started' : 'Next'}
                {!isLast && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
