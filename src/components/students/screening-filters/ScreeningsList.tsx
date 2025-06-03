
import React, { useState } from 'react';
import ScreeningCard from './ScreeningCard';
import ScreeningDetailsModal from '../screening-history/ScreeningDetailsModal';
import { Student } from '@/types/database';

interface Screening {
  id: string;
  type: 'speech' | 'hearing' | 'progress';
  date: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  screener: string;
  results?: string;
  screening_result?: 'P' | 'M' | 'Q' | 'NR' | 'NC' | 'C';
}

interface ScreeningsListProps {
  studentId?: string;
  searchTerm: string;
  filterType: string;
  filterStatus: string;
  student?: Student;
}

const ScreeningsList = ({ 
  studentId, 
  searchTerm, 
  filterType, 
  filterStatus, 
  student 
}: ScreeningsListProps) => {
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock screenings data - replace with actual API call
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
  ];

  const filteredScreenings = mockScreenings.filter(screening => {
    const matchesSearch = screening.screener.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         screening.results?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || screening.type === filterType;
    const matchesStatus = filterStatus === 'all' || screening.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleViewDetails = (screening: Screening) => {
    setSelectedScreening(screening);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedScreening(null);
  };

  const hasFilters = Boolean(searchTerm) || filterType !== 'all' || filterStatus !== 'all';

  if (filteredScreenings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {hasFilters ? 'No screenings match your current filters.' : 'No screenings found for this student.'}
        </p>
        {hasFilters && (
          <p className="text-sm text-gray-400 mt-1">
            Try adjusting your search criteria or filters.
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {filteredScreenings.map((screening) => (
          <ScreeningCard 
            key={screening.id} 
            screening={screening}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      <ScreeningDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        screening={selectedScreening}
        student={student}
      />
    </>
  );
};

export default ScreeningsList;
