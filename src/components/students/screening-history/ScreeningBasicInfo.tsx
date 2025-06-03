
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, FileText } from 'lucide-react';
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

interface ScreeningBasicInfoProps {
  screening: Screening;
}

const ScreeningBasicInfo = ({ screening }: ScreeningBasicInfoProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Screening Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">Date:</span>
          <span className="text-sm text-gray-600">
            {format(new Date(screening.date), 'MMMM dd, yyyy')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">Screener:</span>
          <span className="text-sm text-gray-600">{screening.screener}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">Screening ID:</span>
          <span className="text-sm text-gray-600">{screening.id}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScreeningBasicInfo;
