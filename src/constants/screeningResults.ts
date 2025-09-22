export const SCREENING_RESULTS = {
  no_errors: { label: 'No Errors', color: 'bg-green-100 text-green-800' },
  age_appropriate: { label: 'Age Appropriate', color: 'bg-blue-100 text-blue-800' },
  monitor: { label: 'Monitor', color: 'bg-yellow-100 text-yellow-800' },
  mild: { label: 'Mild', color: 'bg-yellow-100 text-yellow-800' },
  moderate: { label: 'Moderate', color: 'bg-orange-100 text-orange-800' },
  severe: { label: 'Severe', color: 'bg-red-100 text-red-800' },
  profound: { label: 'Profound', color: 'bg-red-300 text-red-800' },
  complex_needs: { label: 'Complex Needs', color: 'bg-purple-300 text-purple-800' },
  unable_to_screen: {
    label: 'Non-Compliant',
    color: 'bg-purple-100 text-purple-800',
  },
  absent: { label: 'Absent', color: 'bg-gray-100 text-gray-800' },
  non_registered_no_consent: {
    label: 'No Consent',
    color: 'bg-gray-100 text-gray-800',
  },
} as const

export type ScreeningResultType = keyof typeof SCREENING_RESULTS