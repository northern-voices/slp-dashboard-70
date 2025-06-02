
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Report {
  id: number;
  title: string;
  type: string;
  date: string;
  status: string;
  studentCount?: number;
  description: string;
}

interface ReportsTableProps {
  reports: Report[];
  loading?: boolean;
}

const ReportsTable = ({
  reports,
  loading = false
}: ReportsTableProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'final':
      case 'completed':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">Completed</Badge>;
      case 'draft':
        return <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-25">Draft</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-medium">Reviewed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'summary':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'individual':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'progress':
        return <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 font-semibold">Recent Reports</CardTitle>
          <CardDescription className="text-gray-500">Your generated reports and assessments</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 shadow-sm bg-white">
      <CardHeader className="pb-4 border-b border-gray-100">
        <CardTitle className="text-gray-900 font-semibold">Recent Reports</CardTitle>
        <CardDescription className="text-gray-500">Your generated reports and assessments</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {reports.map(report => (
            <div key={report.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-25/50 space-y-3 sm:space-y-0 transition-colors bg-white shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getReportTypeIcon(report.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900 break-words text-sm leading-tight">{report.title}</h5>
                  <p className="text-sm text-gray-500 break-words mt-1 leading-tight">{report.description}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="text-xs text-gray-500 font-medium">{report.date}</span>
                    {report.studentCount && (
                      <span className="text-xs text-gray-500">• {report.studentCount} students</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end space-x-3 sm:flex-col sm:space-x-0 sm:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-3">
                {getStatusBadge(report.status)}
                <Button variant="outline" size="sm" className="h-9 border-gray-200 text-gray-700 hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportsTable;
