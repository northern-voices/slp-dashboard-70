
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText } from 'lucide-react';

interface SpeechScreeningStep3Props {
  form: UseFormReturn<any>;
}

const SpeechScreeningStep3 = ({ form }: SpeechScreeningStep3Props) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Screening Results & Final Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="speech_screen_result">Speech Screen Result *</Label>
            <Select value={form.watch('speech_screen_result')} onValueChange={(value) => form.setValue('speech_screen_result', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="inconclusive">Inconclusive</SelectItem>
                <SelectItem value="refused">Refused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="vocabulary_support"
                checked={form.watch('vocabulary_support')}
                onCheckedChange={(checked) => form.setValue('vocabulary_support', checked)}
              />
              <Label htmlFor="vocabulary_support">Vocabulary Support (Language Ladder)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="suspected_cas"
                checked={form.watch('suspected_cas')}
                onCheckedChange={(checked) => form.setValue('suspected_cas', checked)}
              />
              <Label htmlFor="suspected_cas">Suspected CAS</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="clinical_notes">Clinical Notes (Private)</Label>
            <Textarea
              {...form.register('clinical_notes')}
              placeholder="Enter private clinical observations and notes..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="recommendations_referrals">Recommendations and Referrals</Label>
            <Textarea
              {...form.register('recommendations_referrals')}
              placeholder="Enter recommendations and referral information..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="attendance">Attendance (for progress reports)</Label>
            <Textarea
              {...form.register('attendance')}
              placeholder="Enter attendance information..."
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeechScreeningStep3;
