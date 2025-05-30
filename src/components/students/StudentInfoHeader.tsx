
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, GraduationCap, Phone, FileText } from 'lucide-react';
import { Database } from '@/types/supabase';

type Student = Database['public']['Tables']['students']['Row'];

interface StudentInfoHeaderProps {
  student: Student | null;
}

// Mock student data for demonstration when no student is provided
const mockStudent: Student = {
  id: '1',
  first_name: 'Emma',
  last_name: 'Johnson',
  date_of_birth: '2010-05-15',
  grade: '8th',
  gender: 'female',
  student_id: 'STU001',
  emergency_contact_name: 'John Johnson',
  emergency_contact_phone: '(555) 123-4567',
  medical_notes: '',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const StudentInfoHeader = ({ student }: StudentInfoHeaderProps) => {
  const displayStudent = student || mockStudent;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Student Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {displayStudent.first_name} {displayStudent.last_name}
              </h3>
              <p className="text-sm text-gray-500">Student ID: {displayStudent.student_id}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                Born {formatDate(displayStudent.date_of_birth)} (Age {calculateAge(displayStudent.date_of_birth)})
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              <Badge variant="secondary">{displayStudent.grade} Grade</Badge>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Emergency Contact</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{displayStudent.emergency_contact_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{displayStudent.emergency_contact_phone}</span>
              </div>
            </div>
          </div>

          {/* Medical Notes */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Medical Notes</h4>
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
              <span className="text-sm text-gray-600">
                {displayStudent.medical_notes || 'No medical notes on file'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentInfoHeader;
