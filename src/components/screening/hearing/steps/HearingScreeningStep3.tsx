
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText } from 'lucide-react';

interface HearingScreeningStep3Props {
  form: UseFormReturn<any>;
}

const HearingScreeningStep3 = ({ form }: HearingScreeningStep3Props) => {
  return (
    <div className="space-y-6">
      <Card className="border-0 rounded-none shadow-none">
        <CardHeader className="px-0 pt-0 pb-0 mb-6">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <FileText className="w-5 h-5" />
            Results & Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-0">
          <div>
            <Label htmlFor="hearing_observations" className="mb-3 block text-sm font-medium text-gray-700">
              Behavioral Observations
            </Label>
            <Textarea
              placeholder="Note student's responses to sounds, following directions, attention during testing, any concerns raised by teacher/parent..."
              rows={4}
              {...form.register('hearing_observations')}
            />
          </div>

          <div>
            <Label htmlFor="general_notes" className="mb-3 block text-sm font-medium text-gray-700">
              General Notes
            </Label>
            <Textarea
              placeholder="Additional observations, testing conditions, student cooperation..."
              rows={3}
              {...form.register('general_notes')}
            />
          </div>

          <div>
            <Label htmlFor="recommendations" className="mb-3 block text-sm font-medium text-gray-700">
              Recommendations
            </Label>
            <Textarea
              placeholder="Recommendations for follow-up, referrals, accommodations..."
              rows={3}
              {...form.register('recommendations')}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="follow_up_required"
                {...form.register('follow_up_required')}
              />
              <Label htmlFor="follow_up_required" className="text-sm font-medium text-gray-700">
                Follow-up required
              </Label>
            </div>

            <div>
              <Label htmlFor="follow_up_date" className="mb-3 block text-sm font-medium text-gray-700">
                Follow-up Date
              </Label>
              <Input
                type="date"
                {...form.register('follow_up_date')}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HearingScreeningStep3;
