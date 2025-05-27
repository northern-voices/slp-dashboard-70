
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface NotesRecommendationsSectionProps {
  form: UseFormReturn<any>;
}

const NotesRecommendationsSection = ({ form }: NotesRecommendationsSectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="general_notes">General Notes</Label>
        <Textarea
          {...form.register('general_notes')}
          placeholder="Enter general observations and notes..."
          rows={3}
        />
      </div>
      <div>
        <Label htmlFor="recommendations">Recommendations</Label>
        <Textarea
          {...form.register('recommendations')}
          placeholder="Enter recommendations and next steps..."
          rows={3}
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...form.register('follow_up_required')}
          />
          <span>Follow-up required</span>
        </label>
        {form.watch('follow_up_required') && (
          <div>
            <Label htmlFor="follow_up_date">Follow-up Date</Label>
            <Input
              type="date"
              {...form.register('follow_up_date')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesRecommendationsSection;
