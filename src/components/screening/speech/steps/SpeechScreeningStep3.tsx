
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic } from 'lucide-react';

interface SpeechScreeningStep3Props {
  form: UseFormReturn<any>;
}

const SpeechScreeningStep3 = ({ form }: SpeechScreeningStep3Props) => {
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
              <h2 className="text-xl font-semibold">Speech Screening - Step 3</h2>
              <p className="text-sm text-blue-600 font-normal">
                Results and Final Documentation
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Speech Screen Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Speech Screen Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="speech_screen_result">Speech Screen Result</Label>
              <Select
                value={form.watch('speech_screen_result')}
                onValueChange={(value) => form.setValue('speech_screen_result', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="inconclusive">Inconclusive</SelectItem>
                  <SelectItem value="unable_to_screen">Unable to Screen</SelectItem>
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
                <Label htmlFor="vocabulary_support" className="text-sm">
                  Vocabulary Support
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="suspected_cas"
                  checked={form.watch('suspected_cas')}
                  onCheckedChange={(checked) => form.setValue('suspected_cas', checked)}
                />
                <Label htmlFor="suspected_cas" className="text-sm">
                  Suspected CAS
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Clinical Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="clinical_notes">Clinical Notes (Private)</Label>
            <Textarea
              {...form.register('clinical_notes')}
              placeholder="Enter private clinical notes..."
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="recommendations">Recommendations and Referrals</Label>
            <Textarea
              {...form.register('recommendations')}
              placeholder="Enter recommendations and referral information..."
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="attendance">Attendance</Label>
            <Textarea
              {...form.register('attendance')}
              placeholder="Note any attendance concerns or patterns..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Follow-up */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Follow-up</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="follow_up_required"
              checked={form.watch('follow_up_required')}
              onCheckedChange={(checked) => form.setValue('follow_up_required', checked)}
            />
            <Label htmlFor="follow_up_required">Follow-up Required</Label>
          </div>
          {form.watch('follow_up_required') && (
            <div>
              <Label htmlFor="follow_up_date">Follow-up Date</Label>
              <Input
                type="date"
                {...form.register('follow_up_date')}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeechScreeningStep3;
