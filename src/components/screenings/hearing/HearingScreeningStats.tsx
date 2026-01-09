import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, CheckCircle, XCircle, UserX } from 'lucide-react'
import { Screening } from '@/types/database'

interface HearingScreeningStatsProps {
  screenings: Screening[]
  onFilterClick?: (filterValue: string) => void
  onClearAllFilters?: () => void
}

const HearingScreeningStats = ({
  screenings = [],
  onFilterClick,
  onClearAllFilters,
}: HearingScreeningStatsProps) => {
  const hearingScreenings = screenings.filter(s => s.source_table === 'hearing')

  const totalScreenings = hearingScreenings.length

  const absentScreenings = hearingScreenings.filter(s => s.result === 'absent').length

  const referredScreenings = hearingScreenings.filter(
    s => s.referral_notes && s.referral_notes.trim().length > 0
  ).length

  const passedScreenings = hearingScreenings.filter(screening => {
    const isNotAbsent = screening.result !== 'absent'
    const hasNoReferralNotes =
      !screening.referral_notes || screening.referral_notes.trim().length === 0

    return isNotAbsent && hasNoReferralNotes
  }).length

  const handleCardClick = (filterValue: string) => {
    if (onFilterClick) {
      onFilterClick(filterValue)
    }
  }

  const handleClearAll = () => {
    if (onClearAllFilters) {
      onClearAllFilters()
    }
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
      {/* Total Screenings */}
      <Card className='cursor-pointer hover:bg-gray-50 transition-colors' onClick={handleClearAll}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Screenings</CardTitle>
          <FileText className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{totalScreenings}</div>
        </CardContent>
      </Card>

      {/* Passed */}
      <Card
        className='cursor-pointer hover:bg-gray-50 transition-colors'
        onClick={() => handleCardClick('passed')}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Passed</CardTitle>
          <CheckCircle className='h-4 w-4 text-green-600' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{passedScreenings}</div>
        </CardContent>
      </Card>

      {/* Referred */}
      <Card
        className='cursor-pointer hover:bg-gray-50 transition-colors'
        onClick={() => handleCardClick('referred')}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Referred</CardTitle>
          <XCircle className='h-4 w-4 text-yellow-600' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{referredScreenings}</div>
        </CardContent>
      </Card>

      {/* Absent */}
      <Card
        className='cursor-pointer hover:bg-gray-50 transition-colors'
        onClick={() => handleCardClick('absent')}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Absent</CardTitle>
          <UserX className='h-4 w-4 text-gray-600' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{absentScreenings}</div>
        </CardContent>
      </Card>
    </div>
  )
}

export default HearingScreeningStats
