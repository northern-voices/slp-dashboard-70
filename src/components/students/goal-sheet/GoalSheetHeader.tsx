
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface GoalSheetHeaderProps {
  studentId: string;
}

const GoalSheetHeader = ({ studentId }: GoalSheetHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4 mb-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/students/${studentId}`)}
        className="text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Student
      </Button>
      <div className="h-4 w-px bg-gray-300" />
      <h1 className="text-2xl font-semibold text-gray-900">Generate Goal Sheet</h1>
    </div>
  );
};

export default GoalSheetHeader;
