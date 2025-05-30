
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface HearingTabContentProps {
  onAddHearingScreening?: () => void;
}

const HearingTabContent = ({ onAddHearingScreening }: HearingTabContentProps) => (
  <div className="text-center py-8 text-gray-500">
    <p>No hearing screenings recorded yet.</p>
    <Button className="mt-4" onClick={onAddHearingScreening}>
      <Calendar className="w-4 h-4 mr-2" />
      Add Hearing Screening
    </Button>
  </div>
);

export default HearingTabContent;
