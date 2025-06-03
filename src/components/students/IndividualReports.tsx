
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { FileText, Volume2, Mail, CheckCircle, Target, User } from 'lucide-react';
import { Student } from '@/types/database';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import IndividualReportEmailModal from './IndividualReportEmailModal';

interface IndividualReportsProps {
  student: Student | null;
  isLoading?: boolean;
}

const IndividualReports = ({
  student,
  isLoading = false
}: IndividualReportsProps) => {
  const navigate = useNavigate();
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleGenerateReport = (reportType: string) => {
    if (!student) {
      console.log('Cannot generate report: No student data available');
      return;
    }
    console.log(`Generating ${reportType} for student:`, student.id);
    // TODO: Implement individual report generation
  };

  const isDisabled = !student || isLoading;

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <LoadingSpinner size="md" className="mx-auto mb-2" />
          <p className="text-gray-600 text-sm md:text-base">Loading student data...</p>
        </div>
      </div>;
  }

  if (!student) {
    return <div className="text-center py-8">
        <p className="text-gray-600 text-sm md:text-base">Student data not available</p>
      </div>;
  }

  return <>
      {/* Three Column Layout - Equal Heights and Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Student Individual Card */}
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-4 flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-4 h-4 md:w-5 md:h-5" />
              Student Individual
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Tools for tracking individual student progress and goal management
            </p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3 p-4 md:p-6 pt-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => navigate(`/students/${student.id}/progress-check`)} 
                  variant="outline" 
                  className="w-full h-11 text-sm px-4" 
                  disabled={isDisabled}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Monthly Progress Check
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Track and document student's monthly therapy progress and achievements</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => navigate(`/students/${student.id}/goal-sheet`)} 
                  variant="outline" 
                  className="w-full h-11 text-sm px-4" 
                  disabled={isDisabled}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Generate Goal Sheet
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create individualized therapy goals and objectives for this student</p>
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>

        {/* Speech Reports Card */}
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-4 flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-4 h-4 md:w-5 md:h-5" />
              Speech Reports
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Generate comprehensive speech therapy screening and progress reports
            </p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3 p-4 md:p-6 pt-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => handleGenerateReport('speech-screen')} 
                  variant="outline" 
                  className="w-full h-11 text-sm px-4" 
                  disabled={isDisabled}
                >
                  Speech Screen Report
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate a comprehensive speech screening assessment report</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => handleGenerateReport('progress-report')} 
                  variant="outline" 
                  className="w-full h-11 text-sm px-4" 
                  disabled={isDisabled}
                >
                  Progress Report
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create a detailed progress summary for speech therapy services</p>
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>

        {/* Hearing Reports Card */}
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-4 flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
              Hearing Reports
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Create detailed hearing assessment and screening documentation
            </p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3 p-4 md:p-6 pt-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => handleGenerateReport('hearing-screen')} 
                  variant="outline" 
                  className="w-full h-11 text-sm px-4" 
                  disabled={isDisabled}
                >
                  Generate Hearing Screen Report
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate a complete hearing screening assessment document</p>
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>
      </div>

      {/* Send Reports via Email - Full Width Section */}
      

      {student && <IndividualReportEmailModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} student={student} />}
    </>;
};

export default IndividualReports;
