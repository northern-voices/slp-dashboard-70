import { useState } from 'react'
import { Search, Filter, ChevronDown, ChevronUp, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { GRADE_MAPPING } from '@/constants/app'

interface HearingScreeningsFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  dateRangeFilter: string
  setDateRangeFilter: (value: string) => void
  gradeFilter: string
  setGradeFilter: (value: string) => void
  resultFilter: string
  setResultFilter: (value: string) => void
  referralNotesFilter: string
  setReferralNotesFilter: (value: string) => void
  nonCompliantFilter: string
  setNonCompliantFilter: (value: string) => void
  complexNeedsFilter: string
  setComplexNeedsFilter: (value: string) => void
}

const HearingScreeningsFilters = ({
  searchTerm,
  setSearchTerm,
  dateRangeFilter,
  setDateRangeFilter,
  gradeFilter,
  setGradeFilter,
  resultFilter,
  setResultFilter,
  referralNotesFilter,
  setReferralNotesFilter,
  nonCompliantFilter,
  setNonCompliantFilter,
  complexNeedsFilter,
  setComplexNeedsFilter,
}: HearingScreeningsFiltersProps) => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm ||
    dateRangeFilter !== 'school_year' ||
    gradeFilter !== 'all' ||
    resultFilter !== 'all' ||
    referralNotesFilter !== 'all' ||
    nonCompliantFilter !== 'all' ||
    complexNeedsFilter !== 'all'

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('')
    setDateRangeFilter('school_year')
    setGradeFilter('all')
    setResultFilter('all')
    setReferralNotesFilter('all')
    setNonCompliantFilter('all')
    setComplexNeedsFilter('all')
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (searchTerm) count++
    if (dateRangeFilter !== 'school_year') count++
    if (gradeFilter !== 'all') count++
    if (resultFilter !== 'all') count++
    if (referralNotesFilter !== 'all') count++
    if (nonCompliantFilter !== 'all') count++
    if (complexNeedsFilter !== 'all') count++
    return count
  }

  return (
    <div className='space-y-4'>
      {/* Search Bar */}
      <div className='mb-6 mt-5'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          <Input
            placeholder='Search students or screeners...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      <Card className='border border-gray-200 shadow-sm'>
        <Collapsible open={isFiltersExpanded} onOpenChange={setIsFiltersExpanded}>
          <CollapsibleTrigger asChild>
            <CardHeader className='px-5 py-3 cursor-pointer rounded-lg hover:bg-gray-50 transition-colors'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Filter className='w-4 h-4 text-gray-600' />
                  <CardTitle className='text-base font-semibold'>Filters</CardTitle>
                  {hasActiveFilters && (
                    <Badge variant='secondary' className='bg-blue-100 text-blue-700'>
                      {getActiveFilterCount()} active
                    </Badge>
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  {hasActiveFilters && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={e => {
                        e.stopPropagation()
                        clearAllFilters()
                      }}
                      className='text-gray-600 hover:text-gray-900'>
                      <X className='w-4 h-4 mr-1' />
                      Clear All
                    </Button>
                  )}
                  {isFiltersExpanded ? (
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
              {/* Dropdown Filters */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-700'>Date Range</label>
                  <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder='Date Range' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Time</SelectItem>
                      <SelectItem value='today'>Today</SelectItem>
                      <SelectItem value='week'>This Week</SelectItem>
                      <SelectItem value='month'>This Month</SelectItem>
                      <SelectItem value='quarter'>This Quarter</SelectItem>
                      <SelectItem value='school_year'>School Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-700'>Grade</label>
                  <Select value={gradeFilter} onValueChange={setGradeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder='Grade' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Grades</SelectItem>
                      {GRADE_MAPPING.map(grade => (
                        <SelectItem key={grade.value} value={grade.value}>
                          {grade.display}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-700'>Result</label>
                  <Select value={resultFilter} onValueChange={setResultFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder='All Results' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Results</SelectItem>
                      <SelectItem value='passed'>Passed</SelectItem>
                      <SelectItem value='referred'>Referred</SelectItem>
                      <SelectItem value='absent'>Absent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Filters Section */}
              <div className='border-t border-gray-200 pt-4'>
                <h4 className='text-sm font-semibold text-gray-700 mb-3'>Quick Filters</h4>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                  <div className='flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors'>
                    <input
                      type='checkbox'
                      id='referral_notes_filter'
                      checked={referralNotesFilter === 'has_notes'}
                      onChange={e => setReferralNotesFilter(e.target.checked ? 'has_notes' : 'all')}
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    />
                    <label
                      htmlFor='referral_notes_filter'
                      className='text-sm font-medium text-gray-700 cursor-pointer'>
                      Has Referral Notes
                    </label>
                  </div>

                  <div className='flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors'>
                    <input
                      type='checkbox'
                      id='non_compliant_filter'
                      checked={nonCompliantFilter === 'true'}
                      onChange={e => setNonCompliantFilter(e.target.checked ? 'true' : 'all')}
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    />
                    <label
                      htmlFor='non_compliant_filter'
                      className='text-sm font-medium text-gray-700 cursor-pointer'>
                      Non-Compliant
                    </label>
                  </div>

                  <div className='flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors'>
                    <input
                      type='checkbox'
                      id='complex_needs_filter'
                      checked={complexNeedsFilter === 'true'}
                      onChange={e => setComplexNeedsFilter(e.target.checked ? 'true' : 'all')}
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    />
                    <label
                      htmlFor='complex_needs_filter'
                      className='text-sm font-medium text-gray-700 cursor-pointer'>
                      Complex Needs
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  )
}

export default HearingScreeningsFilters
