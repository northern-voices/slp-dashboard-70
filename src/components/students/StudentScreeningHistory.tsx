
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Student } from '@/types/database';
import ScreeningFilters from './screening-filters/ScreeningFilters';
import ScreeningsList from './screening-filters/ScreeningsList';

interface Screening {
  id: string;
  type: 'speech' | 'hearing' | 'progress';
  date: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  screener: string;
  results?: string;
  screening_result?: 'P' | 'M' | 'Q' | 'NR' | 'NC' | 'C';
}

interface StudentScreeningHistoryProps {
  studentId?: string;
  student?: Student | null;
  onAddHearingScreening?: () => void;
}

const StudentScreeningHistory = ({ studentId, student, onAddHearingScreening }: StudentScreeningHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Mock data - replace with actual API call using studentId
  const mockScreenings: Screening[] = [
    {
      id: '1',
      type: 'speech',
      date: '2024-05-15',
      status: 'completed',
      screener: 'Dr. Sarah Johnson',
      results: 'Within normal limits for age group',
      screening_result: 'P',
    },
    {
      id: '2',
      type: 'hearing',
      date: '2024-04-20',
      status: 'completed',
      screener: 'Dr. Mike Wilson',
      results: 'Mild hearing loss detected',
      screening_result: 'M',
    },
    {
      id: '3',
      type: 'progress',
      date: '2024-06-01',
      status: 'in_progress',
      screener: 'Dr. Sarah Johnson',
      screening_result: 'Q',
    },
    {
      id: '4',
      type: 'speech',
      date: '2024-03-10',
      status: 'completed',
      screener: 'Dr. Emily Davis',
      results: 'Articulation concerns noted',
      screening_result: 'M',
    },
    {
      id: '5',
      type: 'hearing',
      date: '2024-02-14',
      status: 'completed',
      screener: 'Dr. Mike Wilson',
      results: 'Normal hearing thresholds',
      screening_result: 'P',
    },
  ];

  const filteredScreenings = mockScreenings.filter(screening => {
    const matchesSearch = screening.screener.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         screening.results?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || screening.type === filterType;
    const matchesStatus = filterStatus === 'all' || screening.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const hasFilters = Boolean(searchTerm) || filterType !== 'all' || filterStatus !== 'all';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Screening History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
          studentId={studentId || ''}
          hasFilters={hasFilters}
          student={student}
        />
      </CardContent>
    </Card>
  );
};

export default StudentScreeningHistory;
