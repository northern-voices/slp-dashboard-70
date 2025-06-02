
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Search, Filter, Eye, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import { OrganizationProvider } from '@/contexts/OrganizationContext';

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
  const navigate = useNavigate();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'speech':
        return 'bg-purple-100 text-purple-800';
      case 'hearing':
        return 'bg-teal-100 text-teal-800';
      case 'progress':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <OrganizationProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <Header />
            <div className="flex-1 bg-gray-25 p-4 md:p-6 lg:p-8">
              <div className="max-w-6xl mx-auto">
                {/* Header with Breadcrumb */}
                <div className="flex items-center gap-4 mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/students/${studentId}`)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Student
                  </Button>
                  <div className="h-4 w-px bg-gray-300" />
                  <h1 className="text-2xl font-semibold text-gray-900">View Screenings</h1>
                </div>

                {/* Filters and Search */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search by screener name or results..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Select value={filterType} onValueChange={setFilterType}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="speech">Speech</SelectItem>
                            <SelectItem value="hearing">Hearing</SelectItem>
                            <SelectItem value="progress">Progress</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Screenings List */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>All Screenings ({filteredScreenings.length})</CardTitle>
                    <Button onClick={() => navigate(`/students/${studentId}`)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Screening
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {filteredScreenings.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <Filter className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Screenings Found</h3>
                        <p className="text-gray-600">
                          {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                            ? 'Try adjusting your filters or search terms.'
                            : 'No screenings have been recorded for this student yet.'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredScreenings.map((screening) => (
                          <div
                            key={screening.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge className={getTypeColor(screening.type)}>
                                    {screening.type.charAt(0).toUpperCase() + screening.type.slice(1)}
                                  </Badge>
                                  <Badge className={getStatusColor(screening.status)}>
                                    {screening.status.replace('_', ' ').charAt(0).toUpperCase() + 
                                     screening.status.replace('_', ' ').slice(1)}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {format(new Date(screening.date), 'MMM dd, yyyy')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>Screener:</strong> {screening.screener}
                                </p>
                                {screening.results && (
                                  <p className="text-sm text-gray-600">
                                    <strong>Results:</strong> {screening.results}
                                  </p>
                                )}
                              </div>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </OrganizationProvider>
  );
};

export default ViewScreenings;
