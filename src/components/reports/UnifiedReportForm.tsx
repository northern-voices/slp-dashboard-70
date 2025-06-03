
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Multiselect from '@/components/ui/multiselect';

const UnifiedReportForm = () => {
  const [reportType, setReportType] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [email, setEmail] = useState('');

  const reportTypes = [
    { value: 'hearing', label: 'Class Wide Hearing Screen' },
    { value: 'speech-screens', label: 'Class Wide Speech Screens' },
    { value: 'goal-sheets', label: 'Class Wide Goal Sheets' },
    { value: 'progress-reports', label: 'Class Wide Progress Reports' }
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
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-semibold text-gray-900">Generate Class Wide Report</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Report Type</Label>
            <RadioGroup value={reportType} onValueChange={setReportType} className="grid grid-cols-1 gap-3">
              {reportTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.value} id={type.value} />
                  <Label 
                    htmlFor={type.value} 
                    className="text-sm font-normal text-gray-700 cursor-pointer flex-1"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
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

          <div className="flex gap-3 pt-6">
            <Button type="button" variant="outline" onClick={handleClearForm}>
              Clear Form
            </Button>
            <Button type="submit">
              Generate Report
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UnifiedReportForm;
