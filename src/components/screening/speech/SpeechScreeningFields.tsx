
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SpeechScreeningFieldsProps {
  form: UseFormReturn<any>;
}

const SpeechScreeningFields = ({ form }: SpeechScreeningFieldsProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Speech Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="articulation_notes">Articulation Notes</Label>
            <Textarea
              {...form.register('articulation_notes')}
              placeholder="Enter articulation observations..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="language_concerns">Language Concerns</Label>
            <Textarea
              {...form.register('language_concerns')}
              placeholder="Enter language observations..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="voice_quality">Voice Quality</Label>
            <Select value={form.watch('voice_quality')} onValueChange={(value) => form.setValue('voice_quality', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select voice quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="hoarse">Hoarse</SelectItem>
                <SelectItem value="breathy">Breathy</SelectItem>
                <SelectItem value="harsh">Harsh</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fluency_notes">Fluency Notes</Label>
            <Textarea
              {...form.register('fluency_notes')}
              placeholder="Enter fluency observations..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="overall_observations">Overall Observations</Label>
            <Textarea
              {...form.register('overall_observations')}
              placeholder="Enter overall observations..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="general_notes">General Notes</Label>
            <Textarea
              {...form.register('general_notes')}
              placeholder="Enter general notes..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="recommendations">Recommendations</Label>
            <Textarea
              {...form.register('recommendations')}
              placeholder="Enter recommendations..."
              rows={3}
              className="mt-1"
            />
          </div>

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
                className="mt-1"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeechScreeningFields;
