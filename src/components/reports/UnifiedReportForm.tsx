
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
      description: 'Generate comprehensive hearing screening reports for entire classrooms or grade levels',
      icon: Volume2,
      tooltip: 'Creates detailed hearing assessment reports including screening results, pass/fail status, and recommendations for follow-up care. Ideal for school nurses and audiologists.'
    },
    {
      value: 'speech-screens',
      label: 'Class Wide Speech Screens',
      description: 'Create detailed speech assessment reports covering multiple students in a class',
      icon: Mic,
      tooltip: 'Produces comprehensive speech screening reports with articulation assessments, language evaluations, and therapy recommendations. Perfect for SLPs and special education teams.'
    },
    {
      value: 'goal-sheets',
      label: 'Class Wide Goal Sheets',
      description: 'Produce individualized goal tracking sheets for all students in selected classes',
      icon: Target,
      tooltip: 'Generates customized goal sheets with specific objectives, progress tracking metrics, and intervention strategies for each student. Used by therapists and IEP teams.'
    },
    {
      value: 'progress-reports',
      label: 'Class Wide Progress Reports',
      description: 'Generate progress summaries showing student achievements and therapy outcomes',
      icon: TrendingUp,
      tooltip: 'Creates comprehensive progress reports highlighting improvements, challenges, and next steps for continued therapy. Shared with parents, teachers, and administrators.'
    }
  ];

  const grades = ['K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
  const currentYear = new Date().getFullYear();
  const academicYears = [
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
    `${currentYear + 1}-${currentYear + 2}`
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
    <TooltipProvider>
      <Card className="w-full max-w-full bg-white border border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 sm:pb-6 px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
            Generate Class Wide Report
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            Create comprehensive reports for multiple students across entire classrooms or grade levels. 
            These reports help educators, administrators, and parents track progress, identify needs, 
            and make informed decisions about student support services.
          </p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Report Type</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-full">
                {reportTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <Tooltip key={type.value}>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => setReportType(type.value)}
                          className={`
                            relative cursor-pointer rounded-lg border-2 p-3 sm:p-4 transition-all duration-200 w-full max-w-full
                            ${reportType === type.value 
                              ? 'border-blue-600 bg-blue-50 shadow-sm' 
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}
                          `}
                        >
                          <div className="flex items-start space-x-3 w-full">
                            <div className={`
                              flex-shrink-0 p-2 rounded-lg
                              ${reportType === type.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}
                            `}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <h3 className={`
                                text-sm font-medium leading-tight truncate
                                ${reportType === type.value ? 'text-blue-900' : 'text-gray-900'}
                              `}>
                                {type.label}
                              </h3>
                              <p className={`
                                text-xs mt-1 leading-tight
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
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p>{type.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 w-full max-w-full">
              <Label htmlFor="academic-year" className="text-sm font-medium text-gray-700">Academic Year</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 w-full max-w-full">
              <Label className="text-sm font-medium text-gray-700">Grades</Label>
              <div className="w-full max-w-full">
                <Multiselect
                  options={grades}
                  selected={selectedGrades}
                  onChange={setSelectedGrades}
                  placeholder="Select grades..."
                  className="w-full max-w-full"
                />
              </div>
            </div>

            <div className="space-y-3 w-full max-w-full">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 w-full">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClearForm} 
                    className="w-full sm:w-auto"
                  >
                    Clear Form
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset all form fields to start over</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto"
                  >
                    Generate Report
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create and email the selected report type with your specified criteria</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </form>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default UnifiedReportForm;
