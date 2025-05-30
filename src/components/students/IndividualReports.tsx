
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Volume2 } from 'lucide-react';
import { Student } from '@/types/database';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface IndividualReportsProps {
  student: Student | null;
  isLoading?: boolean;
}

const IndividualReports = ({ student, isLoading = false }: IndividualReportsProps) => {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Individual Reports
          {isLoading && <LoadingSpinner size="sm" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <LoadingSpinner size="md" className="mx-auto mb-2" />
              <p className="text-gray-600">Loading student data...</p>
            </div>
          </div>
        ) : !student ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Student data not available</p>
          </div>
        ) : (
          <>
            {/* Hearing Reports */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Hearing Reports
              </h3>
              <Button 
                onClick={() => handleGenerateReport('hearing-screen')}
                className="w-full sm:w-auto"
                disabled={isDisabled}
              >
                Generate Hearing Screen Report
              </Button>
            </div>

            {/* Speech Reports */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Speech Reports
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={() => handleGenerateReport('speech-screen')}
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={isDisabled}
                >
                  Generate Speech Screen Report
                </Button>
                <Button 
                  onClick={() => handleGenerateReport('goal-sheet')}
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={isDisabled}
                >
                  Generate Goal Sheet
                </Button>
                <Button 
                  onClick={() => handleGenerateReport('progress-report')}
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={isDisabled}
                >
                  Generate Progress Report
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default IndividualReports;
