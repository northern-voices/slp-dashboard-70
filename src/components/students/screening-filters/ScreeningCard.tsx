
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';

interface Screening {
  id: string;
  type: 'speech' | 'hearing' | 'progress';
  date: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  screener: string;
  results?: string;
}

interface ScreeningCardProps {
  screening: Screening;
  onViewDetails?: (screening: Screening) => void;
}

const ScreeningCard = ({ screening, onViewDetails }: ScreeningCardProps) => {
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

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(screening);
    }
  };

  return (
    <div 
      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={handleCardClick}
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
        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </div>
    </div>
  );
};

export default ScreeningCard;
