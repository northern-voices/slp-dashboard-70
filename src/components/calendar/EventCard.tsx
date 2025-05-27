
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  student: string;
  time: string;
  duration: string;
  type: string;
  status: string;
}

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case 'screening':
        return <Badge className="bg-blue-100 text-blue-700 text-xs">Screening</Badge>;
      case 'review':
        return <Badge className="bg-green-100 text-green-700 text-xs">Review</Badge>;
      case 'assessment':
        return <Badge className="bg-purple-100 text-purple-700 text-xs">Assessment</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="text-xs">Scheduled</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-700 text-xs">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 text-xs">Completed</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
      {/* Mobile Layout */}
      <div className="block md:hidden space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center text-blue-600 min-w-0">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
            <div className="min-w-0">
              <span className="font-semibold text-sm">{event.time}</span>
              <span className="text-xs text-gray-500 ml-2">({event.duration})</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {getEventTypeBadge(event.type)}
            {getStatusBadge(event.status)}
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900 text-sm mb-1">{event.title}</h3>
          <p className="text-xs text-gray-600">Student: {event.student}</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            Edit
          </Button>
          <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs">
            Start
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          {/* Time */}
          <div className="flex items-center text-blue-600 flex-shrink-0">
            <Clock className="w-4 h-4 mr-2" />
            <span className="font-semibold text-sm">{event.time}</span>
            <span className="text-xs text-gray-500 ml-2">({event.duration})</span>
          </div>
          
          {/* Event Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{event.title}</h3>
            <p className="text-xs text-gray-600 truncate">Student: {event.student}</p>
          </div>
          
          {/* Badges */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {getEventTypeBadge(event.type)}
            {getStatusBadge(event.status)}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
          <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50">
            Edit
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            Start
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
