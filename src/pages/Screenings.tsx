
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ScreeningStats from '@/components/screenings/ScreeningStats';
import ScreeningsFilters from '@/components/screenings/ScreeningsFilters';
import ScreeningsTable from '@/components/screenings/ScreeningsTable';
import CreateScreeningModal from '@/components/screenings/CreateScreeningModal';

const Screenings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [selectedScreenings, setSelectedScreenings] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on selected screenings:`, selectedScreenings);
    // Implement bulk actions
  };

  return (
    <OrganizationProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <Header />
            <div className="flex-1 bg-gray-25 p-4 md:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-3xl font-semibold text-gray-900 mb-2">Screenings</h1>
                      <p className="text-gray-600">Manage and track all speech and hearing screenings across your organization</p>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Screening
                    </Button>
                  </div>

                  <ScreeningStats />
                </div>

                <div className="space-y-6">
                  <ScreeningsFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    schoolFilter={schoolFilter}
                    setSchoolFilter={setSchoolFilter}
                    dateRangeFilter={dateRangeFilter}
                    setDateRangeFilter={setDateRangeFilter}
                  />

                  <ScreeningsTable
                    searchTerm={searchTerm}
                    typeFilter={typeFilter}
                    statusFilter={statusFilter}
                    schoolFilter={schoolFilter}
                    dateRangeFilter={dateRangeFilter}
                    selectedScreenings={selectedScreenings}
                    setSelectedScreenings={setSelectedScreenings}
                    onBulkAction={handleBulkAction}
                  />
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>

      <CreateScreeningModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </OrganizationProvider>
  );
};

export default Screenings;
