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

interface CaseloadFiltersProps {
  gradeFilter: string
  setGradeFilter: (v: string) => void
  resultFilter: string
  setResultFilter: (v: string) => void
  consentFilter: 'all' | 'yes' | 'no'
  setConsentFilter: (v: 'all' | 'yes' | 'no') => void
  eaFilter: string
  setEaFilter: (v: string) => void
  dateFilter: string
  setDateFilter: (v: string) => void
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
  speechEAs,
  availableSchoolYears,
  onClearAll,
  onPageReset,
}: CaseloadFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const activeCount = [
    gradeFilter !== 'all',
    resultFilter !== 'all',
    consentFilter !== 'all',
    eaFilter !== 'all',
    dateFilter !== 'school_year',
    programStatusFilter !== 'all',
  ].filter(Boolean).length

  const hasActive = activeCount > 0

  const withReset = (setter: (v: string) => void) => (v: string) => {
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
                {hasActive && (
                  <Badge variant='secondary' className='bg-blue-100 text-blue-700'>
                    {activeCount} active
                  </Badge>
                )}
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
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className='pt-0'>
            <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
              {/* Grade */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Grade</label>
                <Select value={gradeFilter} onValueChange={withReset(setGradeFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder='All Grades' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Grades</SelectItem>
                    {GRADE_MAPPING.map(g => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.display}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default CaseloadFilters
