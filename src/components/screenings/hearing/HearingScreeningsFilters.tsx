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

interface HearingScreeningsFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  dateRangeFilter: string
  setDateRangeFilter: (value: string) => void
  gradeFilter: string
  setGradeFilter: (value: string) => void
}

const HearingScreeningsFilters = ({
  searchTerm,
  setSearchTerm,
  dateRangeFilter,
  setDateRangeFilter,
  gradeFilter,
  setGradeFilter,
}: HearingScreeningsFiltersProps) => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm || dateRangeFilter !== 'school_year' || gradeFilter !== 'all'

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('')
    setDateRangeFilter('school_year')
    setGradeFilter('all')
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (searchTerm) count++
    if (dateRangeFilter !== 'school_year') count++
    if (gradeFilter !== 'all') count++
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
                      <SelectItem value='Kindergarten'>Kindergarten</SelectItem>
                      <SelectItem value='1st Grade'>1st Grade</SelectItem>
                      <SelectItem value='2nd Grade'>2nd Grade</SelectItem>
                      <SelectItem value='3rd Grade'>3rd Grade</SelectItem>
                      <SelectItem value='4th Grade'>4th Grade</SelectItem>
                      <SelectItem value='5th Grade'>5th Grade</SelectItem>
                      <SelectItem value='6th Grade'>6th Grade</SelectItem>
                    </SelectContent>
                  </Select>
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
