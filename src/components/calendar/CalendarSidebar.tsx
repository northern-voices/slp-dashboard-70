
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { CalendarDays, Plus, User } from 'lucide-react';

interface CalendarSidebarProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({ selectedDate, onSelectDate }) => {
  return (
    <div className="w-full lg:w-80 lg:flex-shrink-0">
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
            Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calendar Component */}
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={onSelectDate}
              className="w-full text-sm"
            />
          </div>
          
          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-900">Quick Actions</h4>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-left border-gray-200 hover:bg-blue-50 hover:border-blue-300 h-auto py-2"
              >
                <Plus className="w-4 h-4 mr-3 text-blue-600 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Schedule Screening</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-left border-gray-200 hover:bg-green-50 hover:border-green-300 h-auto py-2"
              >
                <User className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                <span className="text-gray-700 text-sm">Book Follow-up</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarSidebar;
