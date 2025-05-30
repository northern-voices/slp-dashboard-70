import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, Filter, Download, Eye, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Database } from '@/types/supabase';

type Report = Database['public']['Tables']['reports']['Row'];

interface DisplayReport {
  id: string;
  title: string;
  type: 'summary' | 'individual' | 'progress';
  date: string;
  status: string;
  description: string;
  studentCount?: number;
}

class ReportTransformer {
  static toDisplayFormat(dbReport: Report): DisplayReport {
    return {
      id: dbReport.id,
      title: dbReport.title,
      type: this.extractReportType(dbReport.title, dbReport.content),
      date: this.formatDate(dbReport.generated_at),
      status: dbReport.status,
      description: this.truncateDescription(dbReport.content),
      studentCount: undefined
    };
  }

  static toDisplayFormatBatch(dbReports: Report[]): DisplayReport[] {
    return dbReports.map(report => this.toDisplayFormat(report));
  }

  private static extractReportType(title: string, content: string): 'summary' | 'individual' | 'progress' {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    
    if (titleLower.includes('summary') || contentLower.includes('summary')) {
      return 'summary';
    }
    if (titleLower.includes('progress') || contentLower.includes('progress')) {
      return 'progress';
    }
    return 'individual';
  }

  private static formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  private static truncateDescription(content: string, maxLength: number = 100): string {
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...' 
      : content;
  }
}

class FilterUtils {
  static filterReports(
    reports: DisplayReport[],
    searchTerm: string,
    reportType: string,
    timeframe?: string
  ): DisplayReport[] {
    return reports.filter(report => {
      const matchesSearch = searchTerm === '' || 
        report.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = reportType === 'all' || 
        report.type === reportType;
      
      return matchesSearch && matchesType;
    });
  }
}

const ReportsPageContent = () => {
  const { userProfile } = useOrganization();
  const [selectedTimeframe, setSelectedTimeframe] = useState('last_month');
  const [selectedReportType, setSelectedReportType] = useState('individual');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const { data: reports, loading, error } = useAsync(
    reportService.getReports,
    true
  );

  const userRole = userProfile?.role || 'slp';
  const userName = userProfile 
    ? `${userProfile.first_name} ${userProfile.last_name}` 
    : 'Dr. Sarah Johnson';

  // Transform database reports to display format
  const transformedReports = reports ? ReportTransformer.toDisplayFormatBatch(reports) : [];

  // Apply filters using utility function
  const filteredReports = FilterUtils.filterReports(
    transformedReports,
    searchTerm,
    selectedReportType,
    selectedTimeframe
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Error loading reports: {error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl text-gray-900 mb-2 font-medium">Reports</h1>
        <p className="text-gray-600 text-base">Generate and manage screening reports and assessments</p>
      </div>

      <ScheduleReportsHero onScheduleClick={() => setShowScheduleModal(true)} />

      <ReportsFilters
        selectedTimeframe={selectedTimeframe}
        setSelectedTimeframe={setSelectedTimeframe}
        selectedReportType={selectedReportType}
        setSelectedReportType={setSelectedReportType}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <ReportsQuickActions />

      <ReportsTable reports={filteredReports} loading={loading} />

      <ScheduleReportsModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
      />
    </>
  );
};

export default ReportsPageContent;
