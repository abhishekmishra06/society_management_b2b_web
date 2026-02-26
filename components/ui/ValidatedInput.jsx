'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Input with validation error display
 */
export default function ValidatedInput({
  label,
  error,
  required,
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}{required && ' *'}</Label>}
      <Input
        className={error ? 'border-red-500 focus:ring-red-500' : ''}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
