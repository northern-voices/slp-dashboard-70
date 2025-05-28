
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  FileText, 
  Calendar, 
  Filter, 
  Mail, 
  Clock,
  AlertCircle 
} from 'lucide-react';
import { ScheduleReportData } from './ScheduleReportsModal';

interface ReviewStepProps {
  formData: ScheduleReportData;
  updateFormData: (updates: Partial<ScheduleReportData>) => void;
}

const ReviewStep = ({ formData }: ReviewStepProps) => {
  const isValid = formData.reportType && formData.reportName && formData.startDate && formData.recipients.length > 0;

  const getFrequencyDescription = () => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    switch (formData.frequency) {
      case 'daily':
        return `Daily at ${formData.timeOfDay}`;
      case 'weekly':
        return `Every ${formData.dayOfWeek !== undefined ? daysOfWeek[formData.dayOfWeek] : 'week'} at ${formData.timeOfDay}`;
      case 'monthly':
        return `Monthly on the ${formData.dayOfWeek}${formData.dayOfWeek === 1 ? 'st' : formData.dayOfWeek === 2 ? 'nd' : formData.dayOfWeek === 3 ? 'rd' : 'th'} at ${formData.timeOfDay}`;
      case 'quarterly':
        return `Quarterly at ${formData.timeOfDay}`;
      default:
        return formData.frequency;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>Review & Activate</span>
        </h3>
        <p className="text-gray-600 mb-6">
          Review your scheduled report configuration and activate when ready.
        </p>
      </div>

      {!isValid && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Missing Required Information</h4>
                <ul className="text-sm text-red-700 mt-1 space-y-1">
                  {!formData.reportType && <li>• Report type is required</li>}
                  {!formData.reportName && <li>• Report name is required</li>}
                  {!formData.startDate && <li>• Start date is required</li>}
                  {formData.recipients.length === 0 && <li>• At least one recipient is required</li>}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Report Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Report Type</Label>
              <div className="text-sm">{formData.reportType || 'Not selected'}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Report Name</Label>
              <div className="text-sm">{formData.reportName || 'Not specified'}</div>
            </div>
          </div>
          {formData.description && (
            <div>
              <Label className="text-sm font-medium text-gray-600">Description</Label>
              <div className="text-sm">{formData.description}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Frequency</Label>
              <div className="text-sm flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{getFrequencyDescription()}</span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Start Date</Label>
              <div className="text-sm">{formData.startDate || 'Not set'}</div>
            </div>
          </div>
          {formData.endDate && (
            <div>
              <Label className="text-sm font-medium text-gray-600">End Date</Label>
              <div className="text-sm">{formData.endDate}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Filters Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Data Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-sm font-medium text-gray-600">Schools</Label>
            <div className="text-sm">
              {formData.schools.length === 0 ? (
                'All schools'
              ) : (
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.schools.map((school) => (
                    <Badge key={school} variant="secondary" className="text-xs">
                      {school}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Grade Levels</Label>
            <div className="text-sm">
              {formData.grades.length === 0 ? (
                'All grades'
              ) : (
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.grades.map((grade) => (
                    <Badge key={grade} variant="secondary" className="text-xs">
                      {grade}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Screening Types</Label>
            <div className="text-sm">
              {formData.screeningTypes.length === 0 ? (
                'All screening types'
              ) : (
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.screeningTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipients Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>Recipients & Delivery</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-sm font-medium text-gray-600">Delivery Method</Label>
            <div className="text-sm">{formData.deliveryMethod}</div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">
              Recipients ({formData.recipients.length})
            </Label>
            <div className="space-y-2 mt-2">
              {formData.recipients.length === 0 ? (
                <div className="text-sm text-gray-500">No recipients added</div>
              ) : (
                formData.recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                    <div>
                      <span className="font-medium">{recipient.name}</span>
                      <span className="text-gray-600 ml-2">({recipient.email})</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {recipient.role}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
          {formData.customMessage && (
            <div>
              <Label className="text-sm font-medium text-gray-600">Custom Message</Label>
              <div className="text-sm bg-gray-50 p-2 rounded mt-1">
                {formData.customMessage}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isValid && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Ready to Activate</h4>
                <p className="text-sm text-green-700 mt-1">
                  Your scheduled report is configured correctly and ready to be activated. 
                  The first report will be generated on {formData.startDate} at {formData.timeOfDay}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper component for labels
const Label = ({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`block text-sm font-medium text-gray-700 ${className || ''}`} {...props}>
    {children}
  </label>
);

export default ReviewStep;
