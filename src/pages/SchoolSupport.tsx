
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Calendar, FileText, HandHeart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockSchoolSupportTickets } from '@/data/mockSchoolSupport';
import { SchoolSupportForm } from '@/types/student-enhancements';
import SupportTicketFilters from '@/components/school-support/SupportTicketFilters';
import SupportTicketsList from '@/components/school-support/SupportTicketsList';
import SupportTicketModal from '@/components/school-support/SupportTicketModal';

const SchoolSupport = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<SchoolSupportForm | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  const handleCreateSupportForm = () => {
    navigate('/school-support/create');
  };

  const handleViewTicketDetails = (ticket: SchoolSupportForm) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  // Filter tickets based on search and filters
  const filteredTickets = mockSchoolSupportTickets.filter(ticket => {
    const matchesSearch = ticket.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || ticket.school_name?.toLowerCase().includes(searchTerm.toLowerCase()) || ticket.slp_names?.some(name => name.toLowerCase().includes(searchTerm.toLowerCase())) || ticket.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesSchool = schoolFilter === 'all' || ticket.school_name === schoolFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesSchool;
  });
  const hasFilters = Boolean(searchTerm) || statusFilter !== 'all' || priorityFilter !== 'all' || schoolFilter !== 'all';

  // Calculate dynamic stats
  const activeTickets = mockSchoolSupportTickets.filter(t => t.status === 'active').length;
  const upcomingVisits = mockSchoolSupportTickets.filter(t => t.status === 'active' && t.support_types.some(type => type.startsWith('school_visit_'))).length;

  return (
    <OrganizationProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <Header />
            <div className="flex-1 bg-gray-25 p-4 md:p-6 lg:p-8">
              <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-3xl font-semibold text-gray-900 mb-2">School Support</h1>
                  <p className="text-gray-600">Manage school support forms and coordination activities</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Support Forms</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{activeTickets}</div>
                      <p className="text-xs text-muted-foreground">Currently in progress</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Upcoming Visits</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{upcomingVisits}</div>
                      <p className="text-xs text-muted-foreground">School visits scheduled</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Support Tickets</h2>
                  <Button variant="outline" size="sm" onClick={handleCreateSupportForm} className="text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                    <HandHeart className="w-4 h-4 mr-2" />
                    Submit Ticket
                  </Button>
                </div>

                <div className="space-y-6">
                  <SupportTicketFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    priorityFilter={priorityFilter}
                    setPriorityFilter={setPriorityFilter}
                    schoolFilter={schoolFilter}
                    setSchoolFilter={setSchoolFilter}
                  />
                  
                  <SupportTicketsList
                    tickets={filteredTickets}
                    hasFilters={hasFilters}
                    onViewDetails={handleViewTicketDetails}
                  />
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>

      <SupportTicketModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        ticket={selectedTicket}
      />
    </OrganizationProvider>
  );
};

export default SchoolSupport;
