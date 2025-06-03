import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  User, 
  Calendar, 
  Phone, 
  FileText, 
  GraduationCap, 
  Edit, 
  UserCheck,
  Save,
  X,
  Trash2,
  TrendingUp
} from 'lucide-react';
import type { Student } from '@/types/database';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

interface StudentInfoHeaderProps {
  student?: Student | null;
  onEdit?: () => void;
  onDelete?: () => void;
  onMoveUpGrade?: () => void;
  isLoading?: boolean;
}

const StudentInfoHeader = ({ 
  student, 
  onEdit, 
  onDelete, 
  onMoveUpGrade, 
  isLoading = false 
}: StudentInfoHeaderProps) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const { toast } = useToast();

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

  const handleEditNotes = () => {
    setEditedNotes(student?.notes || '');
    setIsEditingNotes(true);
  };

  const handleSaveNotes = () => {
    // TODO: Implement save functionality
    console.log('Saving notes:', editedNotes);
    setIsEditingNotes(false);
    toast({
      title: "Notes updated",
      description: "Student notes have been successfully updated.",
    });
  };

  const handleCancelEdit = () => {
    setIsEditingNotes(false);
    setEditedNotes('');
  };

  const handleDeleteStudent = () => {
    if (onDelete) {
      onDelete();
      toast({
        title: "Student deleted",
        description: "The student has been successfully deleted.",
        variant: "destructive",
      });
    }
  };

  const handleMoveUpGrade = () => {
    if (onMoveUpGrade) {
      onMoveUpGrade();
      toast({
        title: "Grade updated",
        description: "Student has been moved up to the next grade.",
      });
    }
  };

  const getNextGrade = (currentGrade?: string) => {
    const gradeMap: { [key: string]: string } = {
      'Pre-K': 'K',
      'K': '1st',
      '1st': '2nd',
      '2nd': '3rd',
      '3rd': '4th',
      '4th': '5th',
      '5th': '6th',
      '6th': '7th',
      '7th': '8th',
      '8th': '9th',
      '9th': '10th',
      '10th': '11th',
      '11th': '12th',
    };
    return gradeMap[currentGrade || ''] || 'Next Grade';
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
              
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <Badge variant={student.active ? "default" : "secondary"} className="flex items-center space-x-1">
                  <UserCheck className="w-3 h-3" />
                  <span>{student.active ? 'Active' : 'Inactive'}</span>
                </Badge>
                
                {/* Move Up Grade Button */}
                {student.grade !== '12th' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Move to {getNextGrade(student.grade)}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Move Student Up Grade</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to move {student.first_name} {student.last_name} from {student.grade} to {getNextGrade(student.grade)}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleMoveUpGrade}>
                          Move Up Grade
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                
                {/* Edit Button */}
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={onEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                
                {/* Delete Button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Student</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {student.first_name} {student.last_name}? This action cannot be undone and will permanently remove all student data, including screening history and reports.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteStudent}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Student
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Medical Notes</span>
                    {!isEditingNotes && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditNotes}
                        className="h-6 px-2 text-gray-500 hover:text-gray-700"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  {isEditingNotes ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editedNotes}
                        onChange={(e) => setEditedNotes(e.target.value)}
                        placeholder="Enter medical notes..."
                        className="min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveNotes}
                          className="h-7 px-3"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="h-7 px-3"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-600">
                      {student.notes || 'No medical notes on file'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentInfoHeader;
