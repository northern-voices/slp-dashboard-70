
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface SchoolSupportHeaderProps {
  studentId: string;
}

const SchoolSupportHeader = ({ studentId }: SchoolSupportHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4 mb-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/')}
        className="text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Button>
      <div className="h-4 w-px bg-gray-300" />
      <h1 className="text-2xl font-semibold text-gray-900">School Support Form</h1>
    </div>
  );
};

export default SchoolSupportHeader;
