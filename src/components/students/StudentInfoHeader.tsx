import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Phone, FileText } from 'lucide-react';
import { Database } from '@/types/supabase';

type Student = Database['public']['Tables']['students']['Row'];

interface StudentInfoHeaderProps {
  student?: Student;
}

const StudentInfoHeader = ({ student }: StudentInfoHeaderProps) => {
  // Mock student data if none provided
  const defaultStudent: Student = {
    id: '1',
    school_id: 'school1',
    student_id: 'STU001',
    first_name: 'Emma',
    last_name: 'Rodriguez',
    date_of_birth: '2015-03-22',
    grade: '3rd Grade',
    gender: 'female',
    emergency_contact_name: 'Maria Rodriguez',
    emergency_contact_phone: '(555) 123-4567',
    notes: null,
    active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  };

  const selectedStudent = student || defaultStudent;

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
    <Card className="bg-white border-gray-100 shadow-sm">
      <CardContent className="flex items-center space-x-6 p-6">
        {/* User Icon */}
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
          <User className="w-8 h-8 text-blue-600" />
        </div>

        {/* Student Info */}
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-gray-900">{selectedStudent.first_name} {selectedStudent.last_name}</h2>
          <div className="text-gray-600 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>ID: {selectedStudent.student_id}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Age: {calculateAge(selectedStudent.date_of_birth)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Grade: {selectedStudent.grade}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-blue-100 text-blue-800 border-none">Active</Badge>
          </div>
        </div>

        {/* Contact Info (Right Aligned) */}
        <div className="ml-auto text-right space-y-1">
          <div className="text-gray-600 flex items-center justify-end space-x-2">
            <Phone className="w-4 h-4" />
            <span>{selectedStudent.emergency_contact_phone}</span>
          </div>
          <div className="text-gray-600">
            <span>Contact: {selectedStudent.emergency_contact_name}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentInfoHeader;
