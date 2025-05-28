
import React, { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import ScheduleReportsModal from './ScheduleReportsModal';
import ScheduleReportsHero from './ScheduleReportsHero';
import ReportsFilters from './ReportsFilters';
import ReportsQuickActions from './ReportsQuickActions';
import ReportsTable from './ReportsTable';
import { useAsync } from '@/hooks/useAsync';
import { reportService } from '@/services/reportService';
import { ReportTransformer, FilterUtils } from '@/utils/dataTransformers';

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
