
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import IndividualReportEmailModal from '../IndividualReportEmailModal';
import { Student } from '@/types/database';
import ScreeningResultBadge from './ScreeningResultBadge';
import ScreeningBasicInfo from './ScreeningBasicInfo';
import ScreeningDetailedContent from './ScreeningDetailedContent';
import ScreeningActions from './ScreeningActions';

interface Screening {
  id: string;
  type: 'speech' | 'hearing' | 'progress';
  date: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  screener: string;
  results?: string;
  screening_result?: 'P' | 'M' | 'Q' | 'NR' | 'NC' | 'C';
}

interface ScreeningDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  screening: Screening | null;
  student?: Student;
}

const ScreeningDetailsModal = ({ isOpen, onClose, screening, student }: ScreeningDetailsModalProps) => {
  const [showEmailModal, setShowEmailModal] = useState(false);

  if (!screening) return null;

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

  const resultDisplay = ScreeningResultBadge({ result: screening.screening_result });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Badge className={getTypeColor(screening.type)}>
                {screening.type.charAt(0).toUpperCase() + screening.type.slice(1)} Screening
              </Badge>
              <Badge className={getStatusColor(screening.status)}>
                {screening.status.replace('_', ' ').charAt(0).toUpperCase() + 
                 screening.status.replace('_', ' ').slice(1)}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <ScreeningBasicInfo screening={screening} />

            {resultDisplay && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Screening Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    {resultDisplay.badge}
                  </div>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {resultDisplay.description}
                  </p>
                </CardContent>
              </Card>
            )}

            <ScreeningDetailedContent screening={screening} />

            <ScreeningActions onSendEmail={() => setShowEmailModal(true)} />
          </div>
        </DialogContent>
      </Dialog>

      {student && (
        <IndividualReportEmailModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          student={student}
        />
      )}
    </>
  );
};

export default ScreeningDetailsModal;
