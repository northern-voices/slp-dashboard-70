
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import ViewScreeningsHeader from '@/components/students/screening-filters/ViewScreeningsHeader';
import ScreeningFilters from '@/components/students/screening-filters/ScreeningFilters';
import ScreeningsList from '@/components/students/screening-filters/ScreeningsList';

interface Screening {
  id: string;
  type: 'speech' | 'hearing' | 'progress';
  date: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  screener: string;
  results?: string;
}

const ViewScreenings = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data - replace with actual API call
  const mockScreenings: Screening[] = [
    {
      id: '1',
      type: 'speech',
      date: '2024-05-15',
      status: 'completed',
      screener: 'Dr. Sarah Johnson',
      results: 'Within normal limits for age group',
    },
    {
      id: '2',
      type: 'hearing',
      date: '2024-04-20',
      status: 'completed',
      screener: 'Dr. Mike Wilson',
      results: 'Mild hearing loss detected',
    },
    {
      id: '3',
      type: 'progress',
      date: '2024-06-01',
      status: 'in_progress',
      screener: 'Dr. Sarah Johnson',
    },
  ];

  const filteredScreenings = mockScreenings.filter(screening => {
    const matchesSearch = screening.screener.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         screening.results?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || screening.type === filterType;
    const matchesStatus = filterStatus === 'all' || screening.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const hasFilters = searchTerm || filterType !== 'all' || filterStatus !== 'all';

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
                />
                <ScreeningsList
                  screenings={filteredScreenings}
                  studentId={studentId}
                  hasFilters={hasFilters}
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
