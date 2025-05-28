import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, BarChart3, User, TrendingUp } from 'lucide-react';
import { ScheduleReportData } from '../ScheduleReportsModal';

interface ReportConfigurationStepProps {
  formData: ScheduleReportData;
  updateFormData: (updates: Partial<ScheduleReportData>) => void;
}

const ReportConfigurationStep = ({ formData, updateFormData }: ReportConfigurationStepProps) => {
  const reportTypes = [
    {
      value: 'summary',
      label: 'Summary Report',
      description: 'Comprehensive overview of all screening activities',
      icon: BarChart3
    },
    {
      value: 'individual',
      label: 'Individual Reports',
      description: 'Detailed reports for specific students',
      icon: User
    },
    {
      value: 'progress',
      label: 'Progress Reports',
      description: 'Track student progress over time',
      icon: TrendingUp
    },
    {
      value: 'custom',
      label: 'Custom Report',
      description: 'Build your own report with selected data points',
      icon: FileText
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Choose Report Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map((type) => (
            <Card
              key={type.value}
              className={`cursor-pointer transition-all hover:shadow-md ${
                formData.reportType === type.value
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => updateFormData({ reportType: type.value })}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <type.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{type.label}</h4>
                    <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="reportName">Report Name *</Label>
          <Input
            id="reportName"
            placeholder="e.g., Monthly Screening Summary"
            value={formData.reportName}
            onChange={(e) => updateFormData({ reportName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description of this scheduled report..."
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      {formData.reportType && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Report Content Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              Customize what data points and visualizations to include in your {formData.reportType} report.
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                'Student demographics',
                'Screening results',
                'Progress charts',
                'Referral statistics',
                'Compliance metrics',
                'Trend analysis'
              ].map((option) => (
                <label key={option} className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportConfigurationStep;
