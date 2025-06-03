
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ScreeningResultBadgeProps {
  result?: string;
}

const ScreeningResultBadge = ({ result }: ScreeningResultBadgeProps) => {
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

  return {
    badge: (
      <Badge className={`${config.color} text-sm font-medium`}>
        {config.label}
      </Badge>
    ),
    description: config.description
  };
};

export default ScreeningResultBadge;
