
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Multiselect from '@/components/ui/multiselect';

const ClassWideHearingForm = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [email, setEmail] = useState('');

  const grades = ['K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
  const currentYear = new Date().getFullYear();
  const academicYears = [
    `${currentYear-1}-${currentYear}`,
    `${currentYear}-${currentYear+1}`,
    `${currentYear+1}-${currentYear+2}`
  ];

  const handleClearForm = () => {
    setAcademicYear('');
    setSelectedGrades([]);
    setEmail('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Generating class-wide hearing report:', {
      academicYear,
      grades: selectedGrades,
      email
    });
    // TODO: Implement report generation
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-semibold text-gray-900">Class Wide Hearing Screen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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

export default ClassWideHearingForm;
