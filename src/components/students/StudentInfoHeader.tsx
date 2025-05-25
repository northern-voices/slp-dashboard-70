
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Mail, Phone, User } from 'lucide-react';
import { Student } from '@/types/database';

// Mock data - in real app this would come from an API
const mockStudent: Student = {
  id: '1',
  school_id: 'school1',
  student_id: 'STU001',
  first_name: 'Emma',
  last_name: 'Johnson',
  date_of_birth: '2015-03-15',
  grade: 'K',
  gender: 'female',
  emergency_contact_name: 'Sarah Johnson',
  emergency_contact_phone: '(555) 123-4567',
  notes: 'Excellent progress in phonemic awareness',
  active: true,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

interface StudentInfoHeaderProps {
  studentId?: string;
}

const StudentInfoHeader = ({ studentId }: StudentInfoHeaderProps) => {
  const student = mockStudent; // In real app, fetch by studentId

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Student Basic Info */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {student.first_name} {student.last_name}
                </h1>
                <p className="text-gray-600">Student ID: {student.student_id}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={student.active ? "default" : "secondary"}>
                    {student.active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">Grade {student.grade}</Badge>
                </div>
              </div>
            </div>

            {/* Student Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Age: {calculateAge(student.date_of_birth)} years old</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>Gender: {student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>Emergency: {student.emergency_contact_phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>Contact: {student.emergency_contact_name}</span>
              </div>
            </div>

            {/* Notes */}
            {student.notes && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Notes:</strong> {student.notes}
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-2 lg:min-w-[200px]">
            <Button className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Screening
            </Button>
            <Button variant="outline" className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              Goal Sheet
            </Button>
            <Button variant="outline" className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Send to Parent/Guardian
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentInfoHeader;
