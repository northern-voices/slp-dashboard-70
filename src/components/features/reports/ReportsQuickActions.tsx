
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { reportService } from '@/services/reportService';
import GenerateReportModal from '@/components/reports/GenerateReportModal';

const ReportsQuickActions = () => {
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const { execute: exportData, loading: exportingData } = useAsync();

  const handleExportData = async () => {
    try {
      const blob = await exportData(() => reportService.exportReport('sample', 'csv')) as Blob | null;
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'screening-data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-900 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Generate Summary Report</span>
            </CardTitle>
            <CardDescription>Create comprehensive reports for multiple students</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full h-11" 
              onClick={() => setShowGenerateReportModal(true)}
            >
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-gray-900 flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Export Data</span>
            </CardTitle>
            <CardDescription>Download screening data in various formats</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full h-11"
              onClick={handleExportData}
              disabled={exportingData}
            >
              <Download className="w-4 h-4 mr-2" />
              {exportingData ? 'Exporting...' : 'Export CSV'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Generate Report Modal */}
      <GenerateReportModal
        isOpen={showGenerateReportModal}
        onClose={() => setShowGenerateReportModal(false)}
      />
    </>
  );
};

export default ReportsQuickActions;
