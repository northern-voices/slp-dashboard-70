
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, RefreshCw } from 'lucide-react';
import { ScheduleReportData } from './ScheduleReportsModal';

interface SchedulingStepProps {
  formData: ScheduleReportData;
  updateFormData: (updates: Partial<ScheduleReportData>) => void;
}

const SchedulingStep = ({ formData, updateFormData }: SchedulingStepProps) => {
  const frequencies = [
    { value: 'daily', label: 'Daily', icon: RefreshCw },
    { value: 'weekly', label: 'Weekly', icon: Calendar },
    { value: 'monthly', label: 'Monthly', icon: Calendar },
    { value: 'quarterly', label: 'Quarterly', icon: Calendar }
  ];

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Frequency</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {frequencies.map((freq) => (
            <Card
              key={freq.value}
              className={`cursor-pointer transition-all hover:shadow-md ${
                formData.frequency === freq.value
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => updateFormData({ frequency: freq.value })}
            >
              <CardContent className="p-4 text-center">
                <freq.icon className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="font-medium">{freq.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(formData.frequency === 'weekly' || formData.frequency === 'monthly') && (
          <div className="space-y-2">
            <Label htmlFor="dayOfWeek">
              {formData.frequency === 'weekly' ? 'Day of Week' : 'Day of Month'}
            </Label>
            {formData.frequency === 'weekly' ? (
              <Select
                value={formData.dayOfWeek?.toString()}
                onValueChange={(value) => updateFormData({ dayOfWeek: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select
                value={formData.dayOfWeek?.toString()}
                onValueChange={(value) => updateFormData({ dayOfWeek: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="timeOfDay">Time of Day</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="timeOfDay"
              type="time"
              value={formData.timeOfDay}
              onChange={(e) => updateFormData({ timeOfDay: e.target.value })}
              className="pl-10"
            />
          </div>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Optional End Date</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => updateFormData({ endDate: e.target.value })}
              />
              <p className="text-sm text-gray-600">
                Leave empty for ongoing reports. The schedule will continue until manually stopped.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Schedule Preview</h4>
              <p className="text-sm text-blue-700 mt-1">
                {formData.frequency === 'daily' && `Reports will be generated daily at ${formData.timeOfDay}`}
                {formData.frequency === 'weekly' && formData.dayOfWeek !== undefined && 
                  `Reports will be generated every ${daysOfWeek[formData.dayOfWeek]} at ${formData.timeOfDay}`}
                {formData.frequency === 'monthly' && formData.dayOfWeek !== undefined && 
                  `Reports will be generated on the ${formData.dayOfWeek}${formData.dayOfWeek === 1 ? 'st' : formData.dayOfWeek === 2 ? 'nd' : formData.dayOfWeek === 3 ? 'rd' : 'th'} of each month at ${formData.timeOfDay}`}
                {formData.frequency === 'quarterly' && `Reports will be generated quarterly at ${formData.timeOfDay}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchedulingStep;
