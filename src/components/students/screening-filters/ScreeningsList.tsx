
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter } from 'lucide-react';
import ScreeningCard from './ScreeningCard';

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
}

const ScreeningsList = ({ screenings, studentId, hasFilters }: ScreeningsListProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">All Screenings ({screenings.length})</h3>
      </div>
      
      {screenings.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 rounded-lg">
          <div className="text-gray-400 mb-4">
            <Filter className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Screenings Found</h3>
          <p className="text-gray-600">
            {hasFilters
              ? 'Try adjusting your filters or search terms.'
              : 'No screenings have been recorded for this student yet.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {screenings.map((screening) => (
            <ScreeningCard key={screening.id} screening={screening} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ScreeningsList;
