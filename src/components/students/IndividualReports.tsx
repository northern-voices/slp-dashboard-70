import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
      {/* Three Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Student Individual Card */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-4 h-4 md:w-5 md:h-5" />
              Student Individual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 md:p-6">
            <Button onClick={() => navigate(`/students/${student.id}/progress-check`)} variant="outline" className="w-full h-11 text-sm px-4" disabled={isDisabled}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Monthly Progress Check
            </Button>
            <Button onClick={() => navigate(`/students/${student.id}/goal-sheet`)} variant="outline" className="w-full h-11 text-sm px-4" disabled={isDisabled}>
              <Target className="w-4 h-4 mr-2" />
              Generate Goal Sheet
            </Button>
          </CardContent>
        </Card>

        {/* Speech Reports Card */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-4 h-4 md:w-5 md:h-5" />
              Speech Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 md:p-6">
            <Button onClick={() => handleGenerateReport('speech-screen')} variant="outline" className="w-full h-11 text-sm px-4" disabled={isDisabled}>
              Speech Screen Report
            </Button>
            <Button onClick={() => handleGenerateReport('progress-report')} variant="outline" className="w-full h-11 text-sm px-4" disabled={isDisabled}>
              Progress Report
            </Button>
          </CardContent>
        </Card>

        {/* Hearing Reports Card */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
              Hearing Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 md:p-6">
            <Button onClick={() => handleGenerateReport('hearing-screen')} variant="outline" className="w-full h-11 text-sm px-4" disabled={isDisabled}>
              Generate Hearing Screen Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Send Reports via Email - Full Width Section */}
      

      {student && <IndividualReportEmailModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} student={student} />}
    </>;
};
export default IndividualReports;