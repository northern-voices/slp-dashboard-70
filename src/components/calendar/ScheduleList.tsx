
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EventCard from './EventCard';

interface Event {
  id: number;
  title: string;
  student: string;
  time: string;
  duration: string;
  type: string;
  status: string;
}

interface ScheduleListProps {
  selectedDate: Date | undefined;
  events: Event[];
}

const ScheduleList: React.FC<ScheduleListProps> = ({ selectedDate, events }) => {
  return (
    <div className="flex-1 min-w-0">
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900">Today's Schedule</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : 'Select a date to view schedule'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleList;
