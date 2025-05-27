
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface ScreeningDetailsSectionProps {
  form: UseFormReturn<any>;
  currentFormType: string;
  setCurrentFormType: (type: 'speech' | 'hearing' | 'progress') => void;
}

const ScreeningDetailsSection = ({
  form,
  currentFormType,
  setCurrentFormType,
}: ScreeningDetailsSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="screening_type">Screening Type</Label>
        <select
          {...form.register('screening_type')}
          className="w-full p-2 border rounded-md"
        >
          <option value="initial">Initial</option>
          <option value="follow_up">Follow-up</option>
          <option value="annual">Annual</option>
          <option value="referral">Referral</option>
        </select>
      </div>
      <div>
        <Label htmlFor="screening_date">Screening Date</Label>
        <Input
          type="date"
          {...form.register('screening_date')}
        />
      </div>
      <div>
        <Label>Form Type</Label>
        <div className="flex gap-2 mt-1">
          {['speech', 'hearing', 'progress'].map((type) => (
            <Badge
              key={type}
              variant={currentFormType === type ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setCurrentFormType(type as any)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScreeningDetailsSection;
