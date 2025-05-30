
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Calendar, FileText, Eye, Clock } from 'lucide-react';
import { Screening } from '@/types/database';

// Mock screening data
const mockScreenings: Screening[] = [
  {
    id: '1',
    student_id: '1',
    slp_id: 'slp1',
    screening_date: '2024-01-20',
    screening_type: 'initial',
    status: 'completed',
    notes: 'Initial speech screening - identified articulation concerns',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
  },
  {
    id: '2',
    student_id: '1',
    slp_id: 'slp1',
    screening_date: '2023-11-15',
    screening_type: 'follow_up',
    status: 'completed',
    notes: 'Follow-up screening - significant improvement in /r/ sound production',
    created_at: '2023-11-15T10:00:00Z',
    updated_at: '2023-11-15T10:00:00Z',
  },
  {
    id: '3',
    student_id: '1',
    slp_id: 'slp1',
    screening_date: '2023-08-10',
    screening_type: 'annual',
    status: 'completed',
    notes: 'Annual screening - continued speech therapy recommended',
    created_at: '2023-08-10T10:00:00Z',
    updated_at: '2023-08-10T10:00:00Z',
  },
  {
    id: '4',
    student_id: '1',
    slp_id: 'slp1',
    screening_date: '2023-03-22',
    screening_type: 'referral',
    status: 'completed',
    notes: 'Teacher referral for speech evaluation',
    created_at: '2023-03-22T10:00:00Z',
    updated_at: '2023-03-22T10:00:00Z',
  },
];

interface StudentScreeningHistoryProps {
  studentId?: string;
}

const StudentScreeningHistory = ({ studentId }: StudentScreeningHistoryProps) => {
  const [openSections, setOpenSections] = useState<string[]>(['recent']);
  
  const screenings = mockScreenings; // In real app, fetch by studentId

  // Group screenings by recency
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentScreenings = screenings.filter(
    screening => new Date(screening.screening_date) >= sixMonthsAgo
  );

  const historicalScreenings = screenings.filter(
    screening => new Date(screening.screening_date) < sixMonthsAgo
  );

  // Group historical screenings by year
  const groupedHistorical = historicalScreenings.reduce((acc, screening) => {
    const year = new Date(screening.screening_date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(screening);
    return acc;
  }, {} as Record<number, Screening[]>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'scheduled': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'initial': return 'Initial';
      case 'follow_up': return 'Follow-up';
      case 'annual': return 'Annual';
      case 'referral': return 'Referral';
      default: return type;
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const ScreeningTableRow = ({ screening }: { screening: Screening }) => (
    <tr className="border-b hover:bg-gray-50 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor(screening.status)} className="text-xs">
            {screening.status}
          </Badge>
          <span className="text-sm font-medium">{getTypeDisplay(screening.screening_type)}</span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date(screening.screening_date).toLocaleDateString()}</span>
        </div>
      </td>
      <td className="p-4">
        <p className="text-sm text-gray-700">{screening.notes}</p>
      </td>
      <td className="p-4">
        <div className="flex gap-1">
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <FileText className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Screening History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="speech" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="speech" className="text-xs sm:text-sm px-2 py-2 sm:px-3">
              <span className="sm:hidden">Speech</span>
              <span className="hidden sm:inline">Speech Screen</span>
            </TabsTrigger>
            <TabsTrigger value="hearing" className="text-xs sm:text-sm px-2 py-2 sm:px-3">
              <span className="sm:hidden">Hearing</span>
              <span className="hidden sm:inline">Hearing Screen</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="speech" className="space-y-6 mt-6">
            {/* Recent Screenings Table */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Recent Screenings (Last 6 months)
              </h3>
              {recentScreenings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium text-gray-700">Type</th>
                        <th className="text-left p-4 font-medium text-gray-700">Date</th>
                        <th className="text-left p-4 font-medium text-gray-700">Notes</th>
                        <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentScreenings.map(screening => (
                        <ScreeningTableRow key={screening.id} screening={screening} />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent screenings found.</p>
              )}
            </div>

            {/* Historical Screenings - Collapsible by Year */}
            {Object.keys(groupedHistorical).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Historical Screenings
                </h3>
                <div className="space-y-2">
                  {Object.entries(groupedHistorical)
                    .sort(([a], [b]) => Number(b) - Number(a))
                    .map(([year, yearScreenings]) => (
                      <Collapsible
                        key={year}
                        open={openSections.includes(year)}
                        onOpenChange={() => toggleSection(year)}
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                          <span className="font-medium text-gray-900">{year} ({yearScreenings.length} screening{yearScreenings.length !== 1 ? 's' : ''})</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${
                            openSections.includes(year) ? 'rotate-180' : ''
                          }`} />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left p-4 font-medium text-gray-700">Type</th>
                                  <th className="text-left p-4 font-medium text-gray-700">Date</th>
                                  <th className="text-left p-4 font-medium text-gray-700">Notes</th>
                                  <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {yearScreenings.map(screening => (
                                  <ScreeningTableRow key={screening.id} screening={screening} />
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="hearing" className="mt-6">
            <div className="text-center py-8 text-gray-500">
              <p>No hearing screenings recorded yet.</p>
              <Button className="mt-4">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Hearing Screen
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StudentScreeningHistory;
