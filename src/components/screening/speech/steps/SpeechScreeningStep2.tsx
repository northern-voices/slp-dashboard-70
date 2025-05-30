
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic } from 'lucide-react';
import SpeechScreeningFields from '../../SpeechScreeningFields';

interface SpeechScreeningStep2Props {
  form: UseFormReturn<any>;
}

const SpeechScreeningStep2 = ({ form }: SpeechScreeningStep2Props) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-blue-800">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Speech Screening - Step 2</h2>
              <p className="text-sm text-blue-600 font-normal">
                Screening Details and Assessment
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Screening Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Screening Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="screening_type">Screening Type</Label>
              <Select
                value={form.watch('screening_type')}
                onValueChange={(value) => form.setValue('screening_type', value)}
              >
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
              <Label htmlFor="screening_date">Screening Date</Label>
              <Input
                type="date"
                {...form.register('screening_date')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Speech Assessment Fields */}
      <SpeechScreeningFields form={form} />
    </div>
  );
};

export default SpeechScreeningStep2;
