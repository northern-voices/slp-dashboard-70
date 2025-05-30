
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, 
  Calendar, 
  Phone, 
  FileText, 
  GraduationCap, 
  Edit, 
  UserCheck 
} from 'lucide-react';
import type { Student } from '@/types/database';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface StudentInfoHeaderProps {
  student?: Student | null;
  onEdit?: () => void;
  isLoading?: boolean;
}

const StudentInfoHeader = ({ student, onEdit, isLoading = false }: StudentInfoHeaderProps) => {
  const getAgeFromBirthDate = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getGenderDisplay = (gender: string) => {
    switch (gender) {
      case 'male':
        return 'Male';
      case 'female':
        return 'Female';
      case 'other':
        return 'Other';
      case 'prefer_not_to_say':
        return 'Prefer not to say';
      default:
        return 'Not specified';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <LoadingSpinner size="md" className="mx-auto mb-2" />
              <p className="text-gray-600">Loading student information...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!student) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-600">Student information not available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Student Basic Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {student.first_name} {student.last_name}
                  </h1>
                  <p className="text-gray-600">Student ID: {student.student_id}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant={student.active ? "default" : "secondary"} className="flex items-center space-x-1">
                  <UserCheck className="w-3 h-3" />
                  <span>{student.active ? 'Active' : 'Inactive'}</span>
                </Badge>
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={onEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </div>

            {/* Student Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start gap-2">
                <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Grade</span>
                  <p className="text-sm text-gray-600">{student.grade}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Age</span>
                  <p className="text-sm text-gray-600">
                    {getAgeFromBirthDate(student.date_of_birth)} years old
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Gender</span>
                  <p className="text-sm text-gray-600">{getGenderDisplay(student.gender)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Emergency Contact</span>
                  <p className="text-sm text-gray-600">{student.emergency_contact_name}</p>
                  <p className="text-sm text-gray-500">{student.emergency_contact_phone}</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="text-sm text-gray-600">
                  {student.notes || 'No medical notes on file'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentInfoHeader;
