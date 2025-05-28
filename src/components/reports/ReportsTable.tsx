
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText } from 'lucide-react';

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
}

const ReportsTable = ({ reports }: ReportsTableProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'summary':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'individual':
        return <FileText className="w-4 h-4 text-green-600" />;
      case 'progress':
        return <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reports</CardTitle>
        <CardDescription>Your generated reports and assessments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-gray-50 space-y-3 sm:space-y-0">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getReportTypeIcon(report.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 break-words">{report.title}</h3>
                  <p className="text-sm text-gray-600 break-words">{report.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">{report.date}</span>
                    {report.studentCount && (
                      <span className="text-xs text-gray-500">• {report.studentCount} students</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end space-x-3 sm:flex-col sm:space-x-0 sm:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-3">
                {getStatusBadge(report.status)}
                <Button variant="outline" size="sm" className="h-9">
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
