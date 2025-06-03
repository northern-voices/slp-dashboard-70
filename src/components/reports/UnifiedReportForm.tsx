
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2, Mic, Target, TrendingUp } from 'lucide-react';
import Multiselect from '@/components/ui/multiselect';

const UnifiedReportForm = () => {
  const [reportType, setReportType] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [email, setEmail] = useState('');

  const reportTypes = [
    { 
      value: 'hearing', 
      label: 'Class Wide Hearing Screen',
      description: 'Class-wide hearing screenings',
      icon: Volume2
    },
    { 
      value: 'speech-screens', 
      label: 'Class Wide Speech Screens',
      description: 'Speech assessment screenings',
      icon: Mic
    },
    { 
      value: 'goal-sheets', 
      label: 'Class Wide Goal Sheets',
      description: 'Student goal tracking sheets',
      icon: Target
    },
    { 
      value: 'progress-reports', 
      label: 'Class Wide Progress Reports',
      description: 'Student progress summaries',
      icon: TrendingUp
    }
  ];

  const grades = ['K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
  const currentYear = new Date().getFullYear();
  const academicYears = [
    `${currentYear-1}-${currentYear}`,
    `${currentYear}-${currentYear+1}`,
    `${currentYear+1}-${currentYear+2}`
  ];

  const handleClearForm = () => {
    setReportType('');
    setAcademicYear('');
    setSelectedGrades([]);
    setEmail('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Generating ${reportType} report:`, {
      reportType,
      academicYear,
      grades: selectedGrades,
      email
    });
    // TODO: Implement report generation
  };

  return (
    <Card className="w-full bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-semibold text-gray-900 text-center sm:text-left">
          Generate Class Wide Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Report Type</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.value}
                    onClick={() => setReportType(type.value)}
                    className={`
                      relative cursor-pointer rounded-lg border-2 p-3 sm:p-4 transition-all duration-200
                      ${reportType === type.value 
                        ? 'border-blue-600 bg-blue-50 shadow-sm' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`
                        flex-shrink-0 p-2 rounded-lg
                        ${reportType === type.value 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-600'
                        }
                      `}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`
                          text-sm font-medium
                          ${reportType === type.value ? 'text-blue-900' : 'text-gray-900'}
                        `}>
                          {type.label}
                        </h3>
                        <p className={`
                          text-xs mt-1
                          ${reportType === type.value ? 'text-blue-700' : 'text-gray-500'}
                        `}>
                          {type.description}
                        </p>
                      </div>
                    </div>
                    {reportType === type.value && (
                      <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="academic-year" className="text-sm font-medium text-gray-700">Academic Year</Label>
            <Select value={academicYear} onValueChange={setAcademicYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Grades</Label>
            <Multiselect
              options={grades}
              selected={selectedGrades}
              onChange={setSelectedGrades}
              placeholder="Select grades..."
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button type="button" variant="outline" onClick={handleClearForm} className="w-full sm:w-auto">
              Clear Form
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Generate Report
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UnifiedReportForm;
