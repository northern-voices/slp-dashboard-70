
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Repeat } from 'lucide-react';
import { ScheduleReportData } from '../ScheduleReportsModal';

interface SchedulingStepProps {
  formData: ScheduleReportData;
  updateFormData: (updates: Partial<ScheduleReportData>) => void;
}

const SchedulingStep = ({ formData, updateFormData }: SchedulingStepProps) => {
  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  const dayOptions = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 0, label: 'Sunday' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>Schedule Configuration</span>
        </h3>
        <p className="text-gray-600 mb-6">
          Set up when and how often your reports should be generated automatically.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Repeat className="w-4 h-4" />
            <span>Frequency</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Report Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => updateFormData({ frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">Day of Week</Label>
                <Select
                  value={formData.dayOfWeek?.toString()}
                  onValueChange={(value) => updateFormData({ dayOfWeek: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {dayOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Timing</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeOfDay">Time of Day</Label>
              <Input
                id="timeOfDay"
                type="time"
                value={formData.timeOfDay}
                onChange={(e) => updateFormData({ timeOfDay: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData({ startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => updateFormData({ endDate: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchedulingStep;
