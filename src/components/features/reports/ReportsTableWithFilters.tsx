
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, MoreHorizontal, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReportService } from '@/services/reportService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ReportsFilters from './ReportsFilters';

interface Report {
  id: string;
  title: string;
  type: string;
  student_name: string;
  date: string;
  status: 'draft' | 'final' | 'reviewed';
  description: string;
}

const ReportsTableWithFilters = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('this_month');
  const [selectedReportType, setSelectedReportType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data since we don't have real reports yet
  const mockReports: Report[] = [
    {
      id: '1',
      title: 'Speech Assessment Report',
      type: 'individual',
      student_name: 'John Doe',
      date: '2024-01-15',
      status: 'final',
      description: 'Comprehensive speech screening assessment for articulation and language development.'
    },
    {
      id: '2',
      title: 'Hearing Screening Report',
      type: 'individual',
      student_name: 'Jane Smith',
      date: '2024-01-14',
      status: 'reviewed',
      description: 'Annual hearing screening assessment with audiometry results.'
    },
    {
      id: '3',
      title: 'Progress Review Report',
      type: 'progress',
      student_name: 'Michael Johnson',
      date: '2024-01-13',
      status: 'draft',
      description: 'Quarterly progress review for ongoing speech therapy intervention.'
    },
    {
      id: '4',
      title: 'Class Summary Report',
      type: 'summary',
      student_name: 'Grade 3 - Room 201',
      date: '2024-01-12',
      status: 'final',
      description: 'Monthly summary report for all screenings conducted in Grade 3.'
    }
  ];

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        // For now, use mock data
        setTimeout(() => {
          setReports(mockReports);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'final':
        return <Badge variant="default" className="bg-green-100 text-green-800">Final</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'reviewed':
        return <Badge variant="secondary">Reviewed</Badge>;
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

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.student_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedReportType === 'all' || report.type === selectedReportType;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ReportsFilters
          selectedTimeframe={selectedTimeframe}
          setSelectedTimeframe={setSelectedTimeframe}
          selectedReportType={selectedReportType}
          setSelectedReportType={setSelectedReportType}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Generated reports and assessments</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReportsFilters
        selectedTimeframe={selectedTimeframe}
        setSelectedTimeframe={setSelectedTimeframe}
        selectedReportType={selectedReportType}
        setSelectedReportType={setSelectedReportType}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>Generated reports and assessments</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Student/Class</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getReportTypeIcon(report.type)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{report.title}</div>
                          <div className="text-sm text-gray-500">{report.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{report.student_name}</TableCell>
                    <TableCell className="capitalize">{report.type}</TableCell>
                    <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getReportTypeIcon(report.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm">{report.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-gray-600">
                      <span className="font-medium">Student:</span> {report.student_name}
                    </span>
                    <span className="text-gray-600">
                      <span className="font-medium">Type:</span> <span className="capitalize">{report.type}</span>
                    </span>
                    <span className="text-gray-600">
                      <span className="font-medium">Date:</span> {new Date(report.date).toLocaleDateString()}
                    </span>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
              </div>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No reports found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsTableWithFilters;
