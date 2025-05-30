
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock } from 'lucide-react';
import { Student } from '@/types/database';
import { mockScreenings } from './screening-history/mockData';
import { groupScreeningsByRecency } from './screening-history/screeningUtils';
import ScreeningTable from './screening-history/ScreeningTable';
import HistoricalScreeningsSection from './screening-history/HistoricalScreeningsSection';
import HearingTabContent from './screening-history/HearingTabContent';

interface StudentScreeningHistoryProps {
  studentId?: string;
  student?: Student | null;
  onAddHearingScreening?: () => void;
}

const StudentScreeningHistory = ({ studentId, student, onAddHearingScreening }: StudentScreeningHistoryProps) => {
  const [openSections, setOpenSections] = useState<string[]>(['recent']);
  
  const screenings = mockScreenings; // In real app, fetch by studentId
  const { recentScreenings, groupedHistorical } = groupScreeningsByRecency(screenings);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

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
            <ScreeningTable 
              screenings={recentScreenings} 
              title="Recent Screenings (Last 6 months)"
              emptyMessage="No recent screenings found."
            />
            
            <HistoricalScreeningsSection
              groupedHistorical={groupedHistorical}
              openSections={openSections}
              toggleSection={toggleSection}
            />
          </TabsContent>
          
          <TabsContent value="hearing" className="mt-6">
            <HearingTabContent onAddHearingScreening={onAddHearingScreening} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StudentScreeningHistory;
