import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Filter, School, Users, Stethoscope } from 'lucide-react';
import { ScheduleReportData } from '../ScheduleReportsModal';

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

  const toggleSelection = (array: string[], item: string, field: keyof ScheduleReportData) => {
    const newArray = array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
    updateFormData({ [field]: newArray });
  };

  const clearAll = (field: keyof ScheduleReportData) => {
    updateFormData({ [field]: [] });
  };

  const selectAll = (items: string[], field: keyof ScheduleReportData) => {
    updateFormData({ [field]: items });
  };

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
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <School className="w-4 h-4" />
              <span>Schools ({formData.schools.length} selected)</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectAll(mockSchools, 'schools')}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearAll('schools')}
              >
                Clear All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {mockSchools.map((school) => (
                <label
                  key={school}
                  className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.schools.includes(school)}
                    onChange={() => toggleSelection(formData.schools, school, 'schools')}
                    className="rounded"
                  />
                  <span className="text-sm">{school}</span>
                </label>
              ))}
            </div>
            {formData.schools.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                {formData.schools.map((school) => (
                  <Badge key={school} variant="secondary" className="text-xs">
                    {school}
                    <button
                      onClick={() => toggleSelection(formData.schools, school, 'schools')}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grade Levels Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Grade Levels ({formData.grades.length} selected)</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectAll(gradeOptions, 'grades')}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearAll('grades')}
              >
                Clear All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {gradeOptions.map((grade) => (
                <label
                  key={grade}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={formData.grades.includes(grade)}
                    onChange={() => toggleSelection(formData.grades, grade, 'grades')}
                    className="rounded"
                  />
                  <span>{grade}</span>
                </label>
              ))}
            </div>
            {formData.grades.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                {formData.grades.map((grade) => (
                  <Badge key={grade} variant="secondary" className="text-xs">
                    {grade}
                    <button
                      onClick={() => toggleSelection(formData.grades, grade, 'grades')}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Screening Types Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Stethoscope className="w-4 h-4" />
              <span>Screening Types ({formData.screeningTypes.length} selected)</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectAll(screeningTypeOptions, 'screeningTypes')}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearAll('screeningTypes')}
              >
                Clear All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {screeningTypeOptions.map((type) => (
                <label
                  key={type}
                  className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.screeningTypes.includes(type)}
                    onChange={() => toggleSelection(formData.screeningTypes, type, 'screeningTypes')}
                    className="rounded"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
            {formData.screeningTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                {formData.screeningTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type}
                    <button
                      onClick={() => toggleSelection(formData.screeningTypes, type, 'screeningTypes')}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataFilteringStep;
