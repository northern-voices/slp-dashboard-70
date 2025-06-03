
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, FileText, Mail, Download, Printer } from 'lucide-react';
import { format } from 'date-fns';
import IndividualReportEmailModal from '../IndividualReportEmailModal';
import { Student } from '@/types/database';

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

  const getScreeningResultDisplay = (result?: string) => {
    if (!result) return null;

    const resultConfig = {
      'P': { 
        label: '(P) Passed (Age-Appropriate)', 
        color: 'bg-green-100 text-green-800',
        description: 'Student demonstrates age-appropriate skills with no concerns identified.'
      },
      'M': { 
        label: '(M) Mild/Moderate (Monitor)', 
        color: 'bg-yellow-100 text-yellow-800',
        description: 'Student shows mild to moderate concerns that require monitoring and possible intervention.'
      },
      'Q': { 
        label: '(Q) Severe/Profound (Qualified for Program)', 
        color: 'bg-red-100 text-red-800',
        description: 'Student demonstrates significant concerns and qualifies for specialized services.'
      },
      'NR': { 
        label: '(NR) Non Registered', 
        color: 'bg-blue-100 text-blue-800',
        description: 'Student was not registered or available for screening at the time.'
      },
      'NC': { 
        label: '(NC) No Consent', 
        color: 'bg-orange-100 text-orange-800',
        description: 'Parent/guardian did not provide consent for screening.'
      },
      'C': { 
        label: '(C) Complex Needs (does NOT qualify)', 
        color: 'bg-red-100 text-red-800',
        description: 'Student has complex needs but does not qualify for this specific program.'
      }
    };

    const config = resultConfig[result as keyof typeof resultConfig];
    if (!config) return null;

    return config;
  };

  const getDetailedContent = () => {
    switch (screening.type) {
      case 'speech':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Articulation Assessment</h4>
              <p className="text-sm text-gray-600">
                {screening.results || 'Comprehensive speech sound assessment completed. All phonemes assessed in initial, medial, and final positions.'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Language Assessment</h4>
              <p className="text-sm text-gray-600">
                Receptive and expressive language skills evaluated. Age-appropriate vocabulary and sentence structure observed.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
              <p className="text-sm text-gray-600">
                Continue monitoring speech development. No immediate intervention required at this time.
              </p>
            </div>
          </div>
        );
      case 'hearing':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Pure Tone Audiometry</h4>
              <p className="text-sm text-gray-600">
                {screening.results || 'Hearing thresholds within normal limits bilaterally across all frequencies tested.'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Tympanometry</h4>
              <p className="text-sm text-gray-600">
                Normal tympanic membrane mobility and middle ear pressure bilaterally.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
              <p className="text-sm text-gray-600">
                Annual hearing screening recommended. No concerns at this time.
              </p>
            </div>
          </div>
        );
      case 'progress':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Goals Assessment</h4>
              <p className="text-sm text-gray-600">
                Student demonstrating progress toward established speech and language goals.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Current Performance</h4>
              <p className="text-sm text-gray-600">
                {screening.results || 'Improved articulation accuracy in structured activities. Generalization to conversational speech in progress.'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
              <p className="text-sm text-gray-600">
                Continue current intervention strategies. Increase focus on generalization activities.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const resultDisplay = getScreeningResultDisplay(screening.screening_result);

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
            {/* Basic Information */}
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

            {/* Screening Result */}
            {resultDisplay && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Screening Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className={`${resultDisplay.color} text-sm font-medium`}>
                      {resultDisplay.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {resultDisplay.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Detailed Results */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Assessment Results</CardTitle>
              </CardHeader>
              <CardContent>
                {getDetailedContent()}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button 
                onClick={() => setShowEmailModal(true)}
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
