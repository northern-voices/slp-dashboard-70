
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Download, Printer } from 'lucide-react';

interface ScreeningActionsProps {
  onSendEmail: () => void;
}

const ScreeningActions = ({ onSendEmail }: ScreeningActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
      <Button 
        onClick={onSendEmail}
        className="flex-1"
      >
        <Mail className="w-4 h-4 mr-2" />
        Send Report via Email
      </Button>
      <Button variant="outline" className="flex-1">
        <Download className="w-4 h-4 mr-2" />
        Download Report
      </Button>
      <Button variant="outline" className="flex-1">
        <Printer className="w-4 h-4 mr-2" />
        Print Report
      </Button>
    </div>
  );
};

export default ScreeningActions;
