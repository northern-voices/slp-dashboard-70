
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

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

  const handleGradeChange = (grade: string, checked: boolean) => {
    if (checked) {
      setSelectedGrades([...selectedGrades, grade]);
    } else {
      setSelectedGrades(selectedGrades.filter(g => g !== grade));
    }
  };

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
    <Card>
      <CardHeader>
        <CardTitle>Class Wide Hearing Screen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="academic-year">Academic Year</Label>
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

          <div>
            <Label>Grades</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {grades.map(grade => (
                <div key={grade} className="flex items-center space-x-2">
                  <Checkbox
                    id={`grade-${grade}`}
                    checked={selectedGrades.includes(grade)}
                    onCheckedChange={(checked) => handleGradeChange(grade, !!checked)}
                  />
                  <Label htmlFor={`grade-${grade}`} className="text-sm">{grade}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>

          <div className="flex gap-2 pt-4">
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
