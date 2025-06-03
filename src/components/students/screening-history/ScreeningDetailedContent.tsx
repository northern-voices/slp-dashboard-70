
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Screening {
  id: string;
  type: 'speech' | 'hearing' | 'progress';
  date: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  screener: string;
  results?: string;
  screening_result?: 'P' | 'M' | 'Q' | 'NR' | 'NC' | 'C';
}

interface ScreeningDetailedContentProps {
  screening: Screening;
}

const ScreeningDetailedContent = ({ screening }: ScreeningDetailedContentProps) => {
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Assessment Results</CardTitle>
      </CardHeader>
      <CardContent>
        {getDetailedContent()}
      </CardContent>
    </Card>
  );
};

export default ScreeningDetailedContent;
