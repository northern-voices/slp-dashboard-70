
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Filter, School, Users, Stethoscope } from 'lucide-react';
import Multiselect from '@/components/ui/multiselect';
import { ScheduleReportData } from './ScheduleReportsModal';

interface DataFilteringStepProps {
  formData: ScheduleReportData;
  updateFormData: (updates: Partial<ScheduleReportData>) => void;
}

const DataFilteringStep = ({ formData, updateFormData }: DataFilteringStepProps) => {
  const mockSchools = [
    'Lincoln Elementary',
    'Washington Middle School',
    'Roosevelt High School',
    'Jefferson Academy'
  ];

  const gradeOptions = [
    'Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade',
    '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade',
    '9th Grade', '10th Grade', '11th Grade', '12th Grade'
  ];

  const screeningTypeOptions = [
    'Speech Screening',
    'Hearing Screening',
    'Language Assessment',
    'Articulation Test',
    'Fluency Evaluation'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Data Scope & Filters</span>
        </h3>
        <p className="text-gray-600 mb-6">
          Select which data to include in your scheduled reports. Leave selections empty to include all available data.
        </p>
      </div>

      {/* Schools Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <School className="w-4 h-4" />
            <span>Schools ({formData.schools.length} selected)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label>Select Schools</Label>
            <Multiselect
              options={mockSchools}
              selected={formData.schools}
              onChange={(selected) => updateFormData({ schools: selected })}
              placeholder="Select schools..."
              searchPlaceholder="Search schools..."
              emptyMessage="No schools found."
            />
          </div>
        </CardContent>
      </Card>

      {/* Grade Levels Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Grade Levels ({formData.grades.length} selected)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label>Select Grade Levels</Label>
            <Multiselect
              options={gradeOptions}
              selected={formData.grades}
              onChange={(selected) => updateFormData({ grades: selected })}
              placeholder="Select grade levels..."
              searchPlaceholder="Search grades..."
              emptyMessage="No grades found."
            />
          </div>
        </CardContent>
      </Card>

      {/* Screening Types Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Stethoscope className="w-4 h-4" />
            <span>Screening Types ({formData.screeningTypes.length} selected)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label>Select Screening Types</Label>
            <Multiselect
              options={screeningTypeOptions}
              selected={formData.screeningTypes}
              onChange={(selected) => updateFormData({ screeningTypes: selected })}
              placeholder="Select screening types..."
              searchPlaceholder="Search screening types..."
              emptyMessage="No screening types found."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataFilteringStep;
