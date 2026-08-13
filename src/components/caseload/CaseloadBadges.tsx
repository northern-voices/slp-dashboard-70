import { Badge } from '@/components/ui/badge'
import { FileCheck, FileX } from 'lucide-react'
import { SCREENING_RESULTS } from '@/constants/screeningResults'
import { ProgramStatus, ServiceStatus } from '@/types/database'

const RESULT_BADGE_LABELS: Partial<Record<keyof typeof SCREENING_RESULTS, string>> = {
  complex_needs: 'Complex Needs',
  unable_to_screen: 'Refusal / Non-Compliant',
}

export const ResultBadge = ({ result }: { result?: string | null }) => {
  if (!result) return <span className='text-sm text-gray-400'>-</span>

  const config = SCREENING_RESULTS[result as keyof typeof SCREENING_RESULTS]
  if (!config) return <span className='text-sm text-gray-400'>-</span>

  const label = RESULT_BADGE_LABELS[result as keyof typeof SCREENING_RESULTS] ?? config.label

  return (
    <Badge
      title={config.label}
      className={`${config.color} font-medium text-[10px] whitespace-nowrap`}>
      {label}
    </Badge>
  )
}

export const ProgramBadge = ({ status }: { status?: ProgramStatus | null }) => {
  switch (status || 'none') {
    case 'qualified':
      return <Badge className='bg-red-100 text-red-800 font-medium text-[10px]'>Qualifies</Badge>
    case 'sub':
      return <Badge className='bg-orange-100 text-orange-800 font-medium text-[10px]'>Sub</Badge>
    case 'no_consent':
      return <Badge className='bg-red-100 text-gray-800 font-medium text-[10px]'>No Consent</Badge>
    case 'graduated':
      return <Badge className='bg-blue-100 text-blue-800 font-medium text-[10px]'>Graduated</Badge>
    default:
      return (
        <Badge className='bg-green-100 text-green-800 font-medium text-[10px]'>
          Not In Program
        </Badge>
      )
  }
}

export const ServiceStatusTag = ({ status }: { status?: ServiceStatus | null }) => {
  switch (status) {
    case 'paused':
      return (
        <Badge className='bg-purple-100 text-purple-800 font-medium text-[10px]'>
          Paused / Away
        </Badge>
      )
    default:
      return null
  }
}

export const ConsentBadge = ({ hasConsent }: { hasConsent: boolean }) => {
  if (hasConsent) {
    return <FileCheck className='w-5 h-5 mx-auto text-green-600' />
  }

  return <FileX className='w-5 h-5 mx-auto text-red-400' />
}
