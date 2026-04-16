import { Badge } from '@/components/ui/badge'

interface HearingEarCellProps {
  volumeDb: number | null | undefined
  volumeResult: string | null | undefined
  compliance: number | null | undefined
  complianceResult: string | null | undefined
  pressure: number | null | undefined
  pressureResult: string | null | undefined
  screeningResult: string | null | undefined
}

const formatValue = (
  value: number | null | undefined,
  result: string | null | undefined,
  unit: string,
  screeningResult?: string | null
) => {
  if (screeningResult === 'absent' || screeningResult === 'non_compliant') return 'N/A'
  if (result === 'Immeasurable') return 'Immeasurable'
  if (value === null || value === undefined) return 'N/A'
  return `${value} ${unit}`
}

const formatResultBadge = (
  result: string | null | undefined,
  screeningResult?: string | null
): string => {
  if (screeningResult === 'absent' || screeningResult === 'non_compliant') return 'N/A'
  return result || '-'
}

const getResultBadgeColor = (result: string | null | undefined) => {
  if (!result || result === '-') return ''
  const normalizedResult = result.toLowerCase()
  if (normalizedResult === 'normal') return 'bg-green-100 text-green-800 border-green-200'
  if (normalizedResult === 'high' || normalizedResult === 'low')
    return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  if (normalizedResult === 'immeasurable') return 'bg-gray-100 text-gray-600 border-gray-200'
  return 'bg-gray-100 text-gray-600 border-gray-200'
}

const HearingEarCell = ({
  volumeDb,
  volumeResult,
  compliance,
  complianceResult,
  pressure,
  pressureResult,
  screeningResult,
}: HearingEarCellProps) => {
  return (
    <div className='space-y-0 divide-y divide-gray-200'>
      <div className='flex items-center py-2'>
        <div className='flex items-center gap-2 flex-1'>
          <span className='text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded'>
            Vol
          </span>
          <span className='text-sm font-semibold text-gray-900'>
            {formatValue(volumeDb, volumeResult, 'ml', screeningResult)}
          </span>
        </div>
        <div className='h-6 w-px bg-gray-300 mx-3'></div>
        <div className='flex-1'>
          <Badge className={`text-xs ${getResultBadgeColor(volumeResult)}`}>
            {formatResultBadge(volumeResult, screeningResult)}
          </Badge>
        </div>
      </div>

      <div className='flex items-center py-2'>
        <div className='flex items-center gap-2 flex-1'>
          <span className='text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded'>
            Comp
          </span>
          <span className='text-sm font-semibold text-gray-900'>
            {formatValue(compliance, complianceResult, 'ml', screeningResult)}
          </span>
        </div>
        <div className='h-6 w-px bg-gray-300 mx-3'></div>
        <div className='flex-1'>
          <Badge className={`text-xs ${getResultBadgeColor(complianceResult)}`}>
            {formatResultBadge(complianceResult, screeningResult)}
          </Badge>
        </div>
      </div>

      <div className='flex items-center py-2'>
        <div className='flex items-center gap-2 flex-1'>
          <span className='text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded'>
            Press
          </span>
          <span className='text-sm font-semibold text-gray-900'>
            {formatValue(pressure, pressureResult, 'daPa', screeningResult)}
          </span>
        </div>
        <div className='h-6 w-px bg-gray-300 mx-3'></div>
        <div className='flex-1'>
          <Badge className={`text-xs ${getResultBadgeColor(pressureResult)}`}>
            {formatResultBadge(pressureResult, screeningResult)}
          </Badge>
        </div>
      </div>
    </div>
  )
}

export default HearingEarCell
