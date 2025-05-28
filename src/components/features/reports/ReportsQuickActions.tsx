
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { useAsync } from '@/hooks/useAsync';
import { reportService } from '@/services/reportService';

const ReportsQuickActions = () => {
  const { execute: generateReport, loading: generatingReport } = useAsync();
  const { execute: exportData, loading: exportingData } = useAsync();

  const handleGenerateReport = async () => {
    try {
      await generateReport(() => reportService.generateReport('template-1', {}));
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const blob = await exportData(() => reportService.exportReport('sample', 'csv'));
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
            onClick={handleGenerateReport}
            disabled={generatingReport}
          >
            {generatingReport ? 'Generating...' : 'Generate Report'}
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
  );
};

export default ReportsQuickActions;
