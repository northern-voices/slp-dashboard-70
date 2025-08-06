import React from 'react'
import { Badge } from '@/components/ui/badge'

interface ScreeningResultBadgeProps {
  result?: string
}

const ScreeningResultBadge = ({ result }: ScreeningResultBadgeProps) => {
  if (!result) return null

  const resultConfig = {
    absent: {
      label: 'Absent',
      color: 'bg-gray-100 text-gray-800',
      description: 'Student was absent during screening.',
    },
    age_appropriate: {
      label: 'Age Appropriate',
      color: 'bg-green-100 text-green-800',
      description: 'Student demonstrates age-appropriate skills with no concerns identified.',
    },
    complex_needs: {
      label: 'Complex Needs',
      color: 'bg-purple-100 text-purple-800',
      description: 'Student has complex needs that require specialized assessment.',
    },
    mild: {
      label: 'Mild',
      color: 'bg-yellow-100 text-yellow-800',
      description: 'Student shows mild concerns that may require monitoring.',
    },
    mild_moderate: {
      label: 'Mild Moderate',
      color: 'bg-yellow-100 text-yellow-800',
      description:
        'Student shows mild to moderate concerns that require monitoring and possible intervention.',
    },
    moderate: {
      label: 'Moderate',
      color: 'bg-orange-100 text-orange-800',
      description: 'Student shows moderate concerns that require intervention.',
    },
    monitor: {
      label: 'Monitor',
      color: 'bg-yellow-100 text-yellow-800',
      description: 'Student requires ongoing monitoring and assessment.',
    },
    non_registered_no_consent: {
      label: 'Non Registered/No Consent',
      color: 'bg-blue-100 text-blue-800',
      description:
        'Student was not registered or parent/guardian did not provide consent for screening.',
    },
    passed: {
      label: 'Passed',
      color: 'bg-green-100 text-green-800',
      description: 'Student passed the screening with no concerns identified.',
    },
    profound: {
      label: 'Profound',
      color: 'bg-red-100 text-red-800',
      description:
        'Student demonstrates profound concerns requiring immediate specialized services.',
    },
    severe: {
      label: 'Severe',
      color: 'bg-red-100 text-red-800',
      description: 'Student demonstrates severe concerns requiring specialized services.',
    },
    severe_profound: {
      label: 'Severe Profound',
      color: 'bg-red-100 text-red-800',
      description:
        'Student demonstrates severe to profound concerns and qualifies for specialized services.',
    },
    unable_to_screen: {
      label: 'Unable to Screen',
      color: 'bg-gray-100 text-gray-800',
      description: 'Unable to complete screening due to various factors.',
    },
  }

  const config = resultConfig[result as keyof typeof resultConfig]
  if (!config) return null

  return {
    badge: <Badge className={`${config.color} text-sm font-medium`}>{config.label}</Badge>,
    description: config.description,
  }
}

export default ScreeningResultBadge
