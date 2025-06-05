
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import ViewScreeningsHeader from '@/components/students/screening-filters/ViewScreeningsHeader';
import ScreeningFilters from '@/components/students/screening-filters/ScreeningFilters';
import ScreeningsList from '@/components/students/screening-filters/ScreeningsList';

const ViewScreenings = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');

  if (!studentId) {
    return <div>Student ID not found</div>;
  }

  return (
    <OrganizationProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <Header />
            <div className="flex-1 bg-gray-25 p-4 md:p-6 lg:p-8">
              <div className="max-w-6xl mx-auto">
                <ViewScreeningsHeader studentId={studentId} />
                <ScreeningFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filterType={filterType}
                  setFilterType={setFilterType}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  dateRangeFilter={dateRangeFilter}
                  setDateRangeFilter={setDateRangeFilter}
                />
                <ScreeningsList
                  studentId={studentId}
                  searchTerm={searchTerm}
                  filterType={filterType}
                  filterStatus={filterStatus}
                  dateRangeFilter={dateRangeFilter}
                />
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </OrganizationProvider>
  );
};

export default ViewScreenings;
