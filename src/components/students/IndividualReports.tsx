
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Volume2, Mail, CheckCircle, Eye, Target } from 'lucide-react';
import { Student } from '@/types/database';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import IndividualReportEmailModal from './IndividualReportEmailModal';

interface IndividualReportsProps {
  student: Student | null;
  isLoading?: boolean;
}

const IndividualReports = ({ student, isLoading = false }: IndividualReportsProps) => {
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

  return (
    <>
      <Card className="h-fit">
        <CardHeader className="pb-4 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <FileText className="w-4 h-4 md:w-5 md:h-5" />
            Individual Reports
            {isLoading && <LoadingSpinner size="sm" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 md:space-y-8 p-4 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 md:py-12">
              <div className="text-center">
                <LoadingSpinner size="md" className="mx-auto mb-2" />
                <p className="text-gray-600 text-sm md:text-base">Loading student data...</p>
              </div>
            </div>
          ) : !student ? (
            <div className="text-center py-8 md:py-12">
              <p className="text-gray-600 text-sm md:text-base">Student data not available</p>
            </div>
          ) : (
            <>
              {/* Student Individual Actions */}
              <div className="space-y-3 md:space-y-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-4 h-4 md:w-5 md:h-5" />
                  Student Individual
                </h3>
                <div className="space-y-3 md:space-y-0 md:flex md:flex-wrap md:gap-3">
                  <Button 
                    onClick={() => navigate(`/students/${student.id}/progress-check`)}
                    variant="outline"
                    className="w-full h-11 md:h-10 md:w-auto text-sm md:text-base px-4 md:px-6"
                    disabled={isDisabled}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Monthly Progress Check
                  </Button>
                  <Button 
                    onClick={() => navigate(`/students/${student.id}/screenings`)}
                    variant="outline"
                    className="w-full h-11 md:h-10 md:w-auto text-sm md:text-base px-4 md:px-6"
                    disabled={isDisabled}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Screenings
                  </Button>
                  <Button 
                    onClick={() => navigate(`/students/${student.id}/goal-sheet`)}
                    variant="outline"
                    className="w-full h-11 md:h-10 md:w-auto text-sm md:text-base px-4 md:px-6"
                    disabled={isDisabled}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Generate Goal Sheet
                  </Button>
                </div>
              </div>

              {/* Hearing Reports */}
              <div className="space-y-3 md:space-y-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
                  Hearing Reports
                </h3>
                <Button 
                  onClick={() => handleGenerateReport('hearing-screen')}
                  className="w-full h-11 md:h-10 md:w-auto text-sm md:text-base px-4 md:px-6"
                  disabled={isDisabled}
                >
                  Generate Hearing Screen Report
                </Button>
              </div>

              {/* Speech Reports */}
              <div className="space-y-3 md:space-y-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 md:w-5 md:h-5" />
                  Speech Reports
                </h3>
                <div className="space-y-3 md:space-y-0 md:flex md:flex-wrap md:gap-3">
                  <Button 
                    onClick={() => handleGenerateReport('speech-screen')}
                    variant="outline"
                    className="w-full h-11 md:h-10 md:w-auto text-sm md:text-base px-4 md:px-6"
                    disabled={isDisabled}
                  >
                    Generate Speech Screen Report
                  </Button>
                  <Button 
                    onClick={() => handleGenerateReport('progress-report')}
                    variant="outline"
                    className="w-full h-11 md:h-10 md:w-auto text-sm md:text-base px-4 md:px-6"
                    disabled={isDisabled}
                  >
                    Generate Progress Report
                  </Button>
                </div>
              </div>

              {/* Send Reports via Email */}
              <div className="border-t pt-4 md:pt-6">
                <Button 
                  onClick={() => setShowEmailModal(true)}
                  variant="default"
                  className="w-full h-11 md:h-10 text-sm md:text-base px-4 md:px-6"
                  disabled={isDisabled}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reports via Email
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {student && (
        <IndividualReportEmailModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          student={student}
        />
      )}
    </>
  );
};

export default IndividualReports;
