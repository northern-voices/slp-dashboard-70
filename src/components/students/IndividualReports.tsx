
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Volume2 } from 'lucide-react';
import { Student } from '@/types/database';

interface IndividualReportsProps {
  student: Student | null;
}

const IndividualReports = ({ student }: IndividualReportsProps) => {
  const handleGenerateReport = (reportType: string) => {
    console.log(`Generating ${reportType} for student:`, student?.id);
    // TODO: Implement individual report generation
  };

  if (!student) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Individual Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hearing Reports */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Hearing Reports
          </h3>
          <Button 
            onClick={() => handleGenerateReport('hearing-screen')}
            className="w-full sm:w-auto"
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
            >
              Generate Speech Screen Report
            </Button>
            <Button 
              onClick={() => handleGenerateReport('goal-sheet')}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Generate Goal Sheet
            </Button>
            <Button 
              onClick={() => handleGenerateReport('progress-report')}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Generate Progress Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndividualReports;
