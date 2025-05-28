
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface ScheduleReportsHeroProps {
  onScheduleClick: () => void;
}

const ScheduleReportsHero = ({ onScheduleClick }: ScheduleReportsHeroProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 mb-8 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-6 md:mb-0">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Schedule Reports</h2>
          <p className="text-blue-100 text-lg">
            Set up automated report generation for recurring needs
          </p>
        </div>
        <Button 
          onClick={onScheduleClick}
          className="bg-white text-blue-600 hover:bg-blue-50 h-12 px-6 font-medium"
        >
          <Calendar className="w-5 h-5 mr-2" />
          Schedule New Report
        </Button>
      </div>
    </div>
  );
};

export default ScheduleReportsHero;
