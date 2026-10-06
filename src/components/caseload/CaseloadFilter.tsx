import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter, X, ChevronUp, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { GRADE_MAPPING } from '@/constants/app'
import { SCREENING_RESULTS } from '@/constants/screeningResults'
import Multiselect from '../ui/multiselect'

const PROGRAM_STATUS_LABELS: Record<string, string> = {
  qualified: 'Qualified',
  sub: 'Subs',
  paused: 'Pause / Away',
  graduated: 'Graduated',
}

interface CaseloadFiltersProps {
  gradeFilter: string[]
  setGradeFilter: (v: string[]) => void
  resultFilter: string
  setResultFilter: (v: string) => void
  consentFilter: 'all' | 'yes' | 'no'
  setConsentFilter: (v: 'all' | 'yes' | 'no') => void
  setProgramStatusFilter: (v: string) => void
  eaFilter: string
  setEaFilter: (v: string) => void
  dateFilter: string
  setDateFilter: (v: string) => void
  returningAbsentFilter: string
  setReturningAbsentFilter: (v: string) => void
  programStatusFilter: string
  speechEAs: Array<{ id: string; name: string }>
  availableSchoolYears: string[]
  onClearAll: () => void
  onPageReset: () => void
}

const CaseloadFilters = ({
  gradeFilter,
  setGradeFilter,
  resultFilter,
  setResultFilter,
  consentFilter,
  setConsentFilter,
  eaFilter,
  setEaFilter,
  dateFilter,
  setDateFilter,
  programStatusFilter,
  setProgramStatusFilter,
  returningAbsentFilter,
  setReturningAbsentFilter,
  speechEAs,
  availableSchoolYears,
  onClearAll,
  onPageReset,
}: CaseloadFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const activeCount = [
    gradeFilter.length > 0,
    resultFilter !== 'all',
    consentFilter !== 'all',
    eaFilter !== 'all',
    dateFilter !== 'school_year',
    programStatusFilter !== 'all',
    returningAbsentFilter !== 'all',
  ].filter(Boolean).length

  const hasActive = activeCount > 0

  // Build the list of currently active filters, excluding School Year (always shown separately)
  const getActiveFilters = (): { key: string; label: string; onRemove: () => void }[] => {
    const filters: { key: string; label: string; onRemove: () => void }[] = []
    gradeFilter.forEach(value => {
      const grade = GRADE_MAPPING.find(g => g.value === value)
      filters.push({
        key: `grade_${value}`,
        label: `Grade: ${grade?.display ?? value}`,
        onRemove: () => withReset(setGradeFilter)(gradeFilter.filter(v => v !== value)),
      })
    })
    if (resultFilter !== 'all') {
      filters.push({
        key: 'result',
        label: `Result: ${SCREENING_RESULTS[resultFilter]?.label ?? resultFilter}`,
        onRemove: () => withReset(setResultFilter)('all'),
      })
    }
    if (consentFilter !== 'all') {
      filters.push({
        key: 'consent',
        label: consentFilter === 'yes' ? 'Consented' : 'No Consent',
        onRemove: () => {
          setConsentFilter('all')
          onPageReset()
        },
      })
    }
    if (eaFilter !== 'all') {
      const ea = speechEAs.find(e => e.id === eaFilter)
      filters.push({
        key: 'ea',
        label: `Speech EA: ${eaFilter === 'none' ? 'Unassigned' : (ea?.name ?? eaFilter)}`,
        onRemove: () => withReset(setEaFilter)('all'),
      })
    }
    if (programStatusFilter !== 'all') {
      filters.push({
        key: 'programStatus',
        label: PROGRAM_STATUS_LABELS[programStatusFilter] ?? programStatusFilter,
        onRemove: () => setProgramStatusFilter('all'),
      })
    }
    if (returningAbsentFilter !== 'all') {
      filters.push({
        key: 'returningAbsent',
        label: 'Returning Students Not Yet Rescreened',
        onRemove: () => {
          setReturningAbsentFilter('all')
          onPageReset()
        },
      })
    }

    return filters
  }

  const withReset =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v)
      onPageReset()
    }

  return (
    <Card className='border border-gray-200 shadow-sm'>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className='px-5 py-3 cursor-pointer rounded-lg hover:bg-gray-50 transition-colors'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Filter className='w-4 h-4 text-gray-600' />
                <CardTitle className='text-base font-semibold'>Filters</CardTitle>
              </div>
              <div className='flex items-center gap-2'>
                {hasActive && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={e => {
                      e.stopPropagation()
                      onClearAll()
                    }}
                    className='text-gray-600 hover:text-gray-900'>
                    <X className='w-4 h-4 mr-1' />
                    Clear All
                  </Button>
                )}
                {isOpen ? (
                  <ChevronUp className='w-4 h-4 text-gray-600' />
                ) : (
                  <ChevronDown className='w-4 h-4 text-gray-600' />
                )}
              </div>
            </div>
            <div className='flex flex-wrap gap-2 mt-2'>
              <Badge
                variant='secondary'
                className='bg-blue-100 text-blue-700 flex items-center gap-1 pr-1'>
                {dateFilter === 'school_year' ? 'This School Year' : dateFilter.replace('sy_', '')}
                {dateFilter !== 'school_year' && (
                  <button
                    type='button'
                    onClick={e => {
                      e.stopPropagation()
                      withReset(setDateFilter)('school_year')
                    }}
                    className='hover:bg-blue-200 rounded-full p-0.5'
                    aria-label='Reset to This School Year'>
                    <X className='w-3 h-3' />
                  </button>
                )}
              </Badge>
              {getActiveFilters().map(filter => (
                <Badge
                  key={filter.key}
                  variant='secondary'
                  className='bg-blue-100 text-blue-700 flex items-center gap-1 pr-1'>
                  {filter.label}
                  <button
                    type='button'
                    onClick={e => {
                      e.stopPropagation()
                      filter.onRemove()
                    }}
                    className='hover:bg-blue-200 rounded-full p-0.5'
                    aria-label={`Remove ${filter.label} filter`}>
                    <X className='w-3 h-3' />
                  </button>
                </Badge>
              ))}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className='pt-0'>
            <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
              {/* Grade */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Grade</label>
                <Multiselect
                  options={GRADE_MAPPING.map(g => g.value)}
                  selected={gradeFilter}
                  onChange={withReset(setGradeFilter)}
                  placeholder='All Grades'
                  searchPlaceholder='Search grades...'
                  emptyMessage='No grades found.'
                  showSelectAll={false}
                />
              </div>

              {/* Result */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Result</label>
                <Select value={resultFilter} onValueChange={withReset(setResultFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder='All Results' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Results</SelectItem>
                    {Object.entries(SCREENING_RESULTS).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Consent */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Consent</label>
                <Select
                  value={consentFilter}
                  onValueChange={v => {
                    setConsentFilter(v as 'all' | 'yes' | 'no')
                    onPageReset()
                  }}>
                  <SelectTrigger>
                    <SelectValue placeholder='All' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All</SelectItem>
                    <SelectItem value='yes'>Consented</SelectItem>
                    <SelectItem value='no'>No Consent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Speech EA */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Speech EA</label>
                <Select value={eaFilter} onValueChange={withReset(setEaFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder='All EAs' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All EAs</SelectItem>
                    <SelectItem value='none'>Unassigned</SelectItem>
                    {speechEAs.map(ea => (
                      <SelectItem key={ea.id} value={ea.id}>
                        {ea.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* School Year */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>School Year</label>
                <Select value={dateFilter} onValueChange={withReset(setDateFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder='This School Year' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='school_year'>This School Year</SelectItem>
                    {availableSchoolYears.map(year => (
                      <SelectItem key={year} value={`sy_${year}`}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='border-t border-gray-200 pt-4 mt-4'>
              <h4 className='text-sm font-semibold text-gray-700 mb-3'>Quick Filters</h4>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                <div className='flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors'>
                  <input
                    type='checkbox'
                    id='returning_absent_filter'
                    checked={returningAbsentFilter === 'true'}
                    onChange={e => {
                      setReturningAbsentFilter(e.target.checked ? 'true' : 'all')
                      onPageReset()
                    }}
                    className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                  />
                  <label
                    htmlFor='returning_absent_filter'
                    className='text-sm font-medium text-gray-700 cursor-pointer'>
                    Returning Students Not Yet Rescreened
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default CaseloadFilters
