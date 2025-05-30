
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import SpeechScreeningFields from '../SpeechScreeningFields';

interface SpeechScreeningStep2Props {
  form: UseFormReturn<any>;
}

const SpeechScreeningStep2 = ({ form }: SpeechScreeningStep2Props) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Screening Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="screening_type" className="mb-2 block">Screening Type *</Label>
              <Select value={form.watch('screening_type')} onValueChange={(value) => form.setValue('screening_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select screening type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="initial">Initial</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="screening_date" className="mb-2 block">Screening Date *</Label>
              <Input
                type="date"
                {...form.register('screening_date')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <SpeechScreeningFields form={form} />
    </div>
  );
};

export default SpeechScreeningStep2;
