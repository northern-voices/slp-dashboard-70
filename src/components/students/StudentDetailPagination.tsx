
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { ChevronLeft, Users } from 'lucide-react';
import { Student } from '@/types/database';

interface StudentDetailPaginationProps {
  currentStudent: Student;
  allStudents: Student[];
  onNavigateToStudent: (studentId: string) => void;
  onBackToStudents: () => void;
}

const StudentDetailPagination = ({ 
  currentStudent, 
  allStudents, 
  onNavigateToStudent,
  onBackToStudents 
}: StudentDetailPaginationProps) => {
  const currentIndex = allStudents.findIndex(student => student.id === currentStudent.id);
  const previousStudent = currentIndex > 0 ? allStudents[currentIndex - 1] : null;
  const nextStudent = currentIndex < allStudents.length - 1 ? allStudents[currentIndex + 1] : null;

  return (
    <div className="flex items-center justify-between py-4 border-t bg-white">
      {/* Back to Students */}
      <Button 
        variant="outline" 
        onClick={onBackToStudents}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        <Users className="w-4 h-4" />
        <span className="hidden sm:inline">Back to Students</span>
        <span className="sm:hidden">Back</span>
      </Button>

      {/* Student Navigation */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 hidden md:inline">
          Student {currentIndex + 1} of {allStudents.length}
        </span>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => previousStudent && onNavigateToStudent(previousStudent.id)}
                className={previousStudent ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
              />
            </PaginationItem>
            
            <PaginationItem>
              <PaginationLink isActive className="px-3 py-2">
                {currentIndex + 1}
              </PaginationLink>
            </PaginationItem>
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => nextStudent && onNavigateToStudent(nextStudent.id)}
                className={nextStudent ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Student Info */}
      <div className="text-sm text-gray-600 text-right hidden lg:block">
        <div className="font-medium">{currentStudent.first_name} {currentStudent.last_name}</div>
        <div className="text-xs text-gray-500">ID: {currentStudent.student_id}</div>
      </div>
    </div>
  );
};

export default StudentDetailPagination;
