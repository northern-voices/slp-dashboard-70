
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, Users, Filter } from 'lucide-react';
import { ScheduleReportData } from '../ScheduleReportsModal';

interface ReviewStepProps {
  formData: ScheduleReportData;
  updateFormData: (updates: Partial<ScheduleReportData>) => void;
}

const ReviewStep = ({ formData }: ReviewStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>Review & Activate</span>
        </h3>
        <p className="text-gray-600 mb-6">
          Review your scheduled report configuration and activate the automation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="font-medium text-sm text-gray-700">Report Type</div>
            <div className="text-gray-900">{formData.reportType || 'Not selected'}</div>
          </div>
          <div>
            <div className="font-medium text-sm text-gray-700">Report Name</div>
            <div className="text-gray-900">{formData.reportName || 'Not provided'}</div>
          </div>
          {formData.description && (
            <div>
              <div className="font-medium text-sm text-gray-700">Description</div>
              <div className="text-gray-900">{formData.description}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="font-medium text-sm text-gray-700">Frequency</div>
            <div className="text-gray-900 capitalize">{formData.frequency}</div>
          </div>
          <div>
            <div className="font-medium text-sm text-gray-700">Time</div>
            <div className="text-gray-900">{formData.timeOfDay}</div>
          </div>
          <div>
            <div className="font-medium text-sm text-gray-700">Start Date</div>
            <div className="text-gray-900">{formData.startDate || 'Not set'}</div>
          </div>
          {formData.endDate && (
            <div>
              <div className="font-medium text-sm text-gray-700">End Date</div>
              <div className="text-gray-900">{formData.endDate}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Data Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="font-medium text-sm text-gray-700 mb-2">Schools ({formData.schools.length})</div>
            <div className="flex flex-wrap gap-1">
              {formData.schools.length > 0 ? (
                formData.schools.map((school) => (
                  <Badge key={school} variant="secondary" className="text-xs">
                    {school}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500 text-sm">All schools</span>
              )}
            </div>
          </div>
          <div>
            <div className="font-medium text-sm text-gray-700 mb-2">Grades ({formData.grades.length})</div>
            <div className="flex flex-wrap gap-1">
              {formData.grades.length > 0 ? (
                formData.grades.map((grade) => (
                  <Badge key={grade} variant="secondary" className="text-xs">
                    {grade}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500 text-sm">All grades</span>
              )}
            </div>
          </div>
          <div>
            <div className="font-medium text-sm text-gray-700 mb-2">Screening Types ({formData.screeningTypes.length})</div>
            <div className="flex flex-wrap gap-1">
              {formData.screeningTypes.length > 0 ? (
                formData.screeningTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500 text-sm">All screening types</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Recipients ({formData.recipients.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="font-medium text-sm text-gray-700">Delivery Method</div>
            <div className="text-gray-900 capitalize">{formData.deliveryMethod}</div>
          </div>
          {formData.recipients.length > 0 && (
            <div>
              <div className="font-medium text-sm text-gray-700 mb-2">Recipients</div>
              <div className="space-y-2">
                {formData.recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-sm">{recipient.name}</div>
                      <div className="text-xs text-gray-600">{recipient.email}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {recipient.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          {formData.customMessage && (
            <div>
              <div className="font-medium text-sm text-gray-700">Custom Message</div>
              <div className="text-gray-900 text-sm bg-gray-50 p-2 rounded">
                {formData.customMessage}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewStep;
