
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Edit, Calendar, Phone, User } from 'lucide-react';
import { Student } from '@/types/database';

interface MobileStudentCardProps {
  student: Student;
  onView: (studentId: string) => void;
  onEdit: (student: Student) => void;
  onScheduleScreening: (student: Student) => void;
  calculateAge: (dateOfBirth: string) => number;
}

const MobileStudentCard = ({ 
  student, 
  onView, 
  onEdit, 
  onScheduleScreening, 
  calculateAge 
}: MobileStudentCardProps) => {
  const handleCardClick = (event: React.MouseEvent) => {
    // Don't navigate if user clicked on action buttons
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]')) {
      return;
    }
    onView(student.id);
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleCardClick}>
      <CardContent className="p-4">
        {/* Student basic info */}
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-base">
                {student.first_name} {student.last_name}
              </h3>
              <p className="text-sm text-gray-600">ID: {student.student_id}</p>
            </div>
            <Badge variant={student.active ? "default" : "secondary"} className="text-xs">
              {student.active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          {/* Grade and Age */}
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Grade {student.grade || 'N/A'} • Age {calculateAge(student.date_of_birth)}
              </span>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="flex items-center gap-1 mb-3">
            <Phone className="w-4 h-4 text-gray-400" />
            <div className="text-sm text-gray-600">
              {student.emergency_contact_name} • {student.emergency_contact_phone}
            </div>
          </div>

          {/* Notes */}
          {student.notes && (
            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded text-xs">
              {student.notes}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onView(student.id);
            }}
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(student);
            }}
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onScheduleScreening(student);
            }}
          >
            <Calendar className="w-3 h-3 mr-1" />
            Screen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileStudentCard;
