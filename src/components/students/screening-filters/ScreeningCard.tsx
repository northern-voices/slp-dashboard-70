
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface Screening {
  id: string;
  type: 'speech' | 'hearing' | 'progress';
  date: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  screener: string;
  results?: string;
  screening_result?: 'P' | 'M' | 'Q' | 'NR' | 'NC' | 'C';
}

interface ScreeningCardProps {
  screening: Screening;
  onViewDetails?: (screening: Screening) => void;
}

const ScreeningCard = ({ screening, onViewDetails }: ScreeningCardProps) => {
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

  const getStatusDisplay = (status: string) => {
    const statusConfig = {
      'completed': {
        icon: CheckCircle,
        text: 'Completed',
        color: 'text-green-600'
      },
      'in_progress': {
        icon: Clock,
        text: 'In Progress',
        color: 'text-yellow-600'
      },
      'scheduled': {
        icon: AlertTriangle,
        text: 'Scheduled',
        color: 'text-blue-600'
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    
    const IconComponent = config.icon;
    return (
      <div className="flex items-center gap-1">
        <IconComponent className={`w-4 h-4 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.text}
        </span>
      </div>
    );
  };

  const getResultBadge = (result?: string) => {
    if (!result) return null;
    
    const resultConfig = {
      'P': { label: '(P) Passed', color: 'bg-green-100 text-green-800 border-green-200' },
      'M': { label: '(M) Monitor', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'Q': { label: '(Q) Qualified', color: 'bg-red-100 text-red-800 border-red-200' },
      'NR': { label: '(NR) Non Registered', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'NC': { label: '(NC) No Consent', color: 'bg-orange-100 text-orange-800 border-orange-200' },
      'C': { label: '(C) Complex Needs', color: 'bg-red-100 text-red-800 border-red-200' }
    };

    const config = resultConfig[result as keyof typeof resultConfig];
    if (!config) return null;

    return (
      <Badge className={`${config.color} border font-semibold text-sm px-3 py-1`}>
        {config.label}
      </Badge>
    );
  };

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(screening);
    }
  };

  return (
    <div 
      className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header with type badge and date */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Badge className={getTypeColor(screening.type)}>
            {screening.type.charAt(0).toUpperCase() + screening.type.slice(1)}
          </Badge>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">
              {format(new Date(screening.date), 'MMM dd, yyyy')}
            </span>
          </div>
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

      {/* Status and Result */}
      <div className="flex items-center justify-between mb-3">
        {getStatusDisplay(screening.status)}
        {getResultBadge(screening.screening_result)}
      </div>

      {/* Screener and Results */}
      <div className="space-y-1">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Screener:</span> {screening.screener}
        </p>
        {screening.results && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Notes:</span> {screening.results}
          </p>
        )}
      </div>
    </div>
  );
};

export default ScreeningCard;
