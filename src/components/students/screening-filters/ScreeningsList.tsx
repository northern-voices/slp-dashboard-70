
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
}

interface ScreeningsListProps {
  screenings: Screening[];
  studentId: string;
  hasFilters: boolean;
  student?: Student;
}

const ScreeningsList = ({ screenings, studentId, hasFilters, student }: ScreeningsListProps) => {
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (screening: Screening) => {
    setSelectedScreening(screening);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedScreening(null);
  };

  if (screenings.length === 0) {
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
        {screenings.map((screening) => (
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
