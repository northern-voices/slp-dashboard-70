import React from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface StudentDetailPaginationProps {
  currentStudent: string;
  totalStudents?: number;
  onNavigateBack: () => void;
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}
const StudentDetailPagination = ({
  currentStudent,
  totalStudents,
  onNavigateBack,
  onNavigatePrevious,
  onNavigateNext,
  hasPrevious = false,
  hasNext = false
}: StudentDetailPaginationProps) => {
  return <div className="flex items-center justify-between mb-6 px-1">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onNavigateBack} className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Students
        </Button>
        
        <div className="h-4 w-px bg-gray-300" />
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">{currentStudent}</span>
          
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" onClick={onNavigatePrevious} disabled={!hasPrevious} className="p-1 h-8 w-8 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <Button variant="ghost" size="sm" onClick={onNavigateNext} disabled={!hasNext} className="p-1 h-8 w-8 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>;
};
export default StudentDetailPagination;