import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Search, Filter, ChevronDown, ChevronUp, X, RefreshCw } from 'lucide-react'

interface ScreeningsFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  resultFilter: string
  setResultFilter: (value: string) => void
  dateRangeFilter: string
  setDateRangeFilter: (value: string) => void
  qualifiesForSpeechProgramFilter: string
  setQualifiesForSpeechProgramFilter: (value: string) => void
  // New filter props
  vocabularySupportFilter: string
  setVocabularySupportFilter: (value: string) => void
  casFilter: string
  setCasFilter: (value: string) => void
  gradeFilter: string
  setGradeFilter: (value: string) => void
  recommendationsFilter: string
  setRecommendationsFilter: (value: string) => void
  clinicalNotesFilter: string
  setClinicalNotesFilter: (value: string) => void
  languageComprehensionFilter: string
  setLanguageComprehensionFilter: (value: string) => void
  priorityRescreenFilter: string
  setPriorityRescreenFilter: (value: string) => void
}

const ScreeningsFilters = ({
  searchTerm,
  setSearchTerm,
  resultFilter,
  setResultFilter,
  dateRangeFilter,
  setDateRangeFilter,
  qualifiesForSpeechProgramFilter,
  setQualifiesForSpeechProgramFilter,
  vocabularySupportFilter,
  setVocabularySupportFilter,
  casFilter,
  setCasFilter,
  gradeFilter,
  setGradeFilter,
  recommendationsFilter,
  setRecommendationsFilter,
  clinicalNotesFilter,
  setClinicalNotesFilter,
  languageComprehensionFilter,
  setLanguageComprehensionFilter,
  priorityRescreenFilter,
  setPriorityRescreenFilter,
}: ScreeningsFiltersProps) => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm ||
    resultFilter !== 'all' ||
    dateRangeFilter !== 'all' ||
    qualifiesForSpeechProgramFilter !== 'all' ||
    vocabularySupportFilter !== 'all' ||
    casFilter !== 'all' ||
    gradeFilter !== 'all' ||
    recommendationsFilter !== 'all' ||
    clinicalNotesFilter !== 'all' ||
    languageComprehensionFilter !== 'all' ||
    priorityRescreenFilter !== 'all'

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('')
    setResultFilter('all')
    setDateRangeFilter('all')
    setQualifiesForSpeechProgramFilter('all')
    setVocabularySupportFilter('all')
    setCasFilter('all')
    setGradeFilter('all')
    setRecommendationsFilter('all')
    setClinicalNotesFilter('all')
    setLanguageComprehensionFilter('all')
    setPriorityRescreenFilter('all')
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (searchTerm) count++
    if (resultFilter !== 'all') count++
    if (dateRangeFilter !== 'all') count++
    if (qualifiesForSpeechProgramFilter !== 'all') count++
    if (vocabularySupportFilter !== 'all') count++
    if (casFilter !== 'all') count++
    if (gradeFilter !== 'all') count++
    if (recommendationsFilter !== 'all') count++
    if (clinicalNotesFilter !== 'all') count++
    if (languageComprehensionFilter !== 'all') count++
    if (priorityRescreenFilter !== 'all') count++
    return count
  }

  return (
    <Card className='border border-gray-200 shadow-sm'>
      <Collapsible open={isFiltersExpanded} onOpenChange={setIsFiltersExpanded}>
        <CardHeader className='px-5 py-2'>
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
                  onClick={clearAllFilters}
                  className='text-gray-600 hover:text-gray-900'>
                  <X className='w-4 h-4 mr-1' />
                  Clear All
                </Button>
              )}
              <CollapsibleTrigger asChild>
                <Button variant='ghost' size='sm' className='text-gray-600 hover:text-gray-900'>
                  {isFiltersExpanded ? (
                    <ChevronUp className='w-4 h-4' />
                  ) : (
                    <ChevronDown className='w-4 h-4' />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className='pt-0'>
            {/* Search Bar - Always Visible */}
            <div className='mb-6'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <Input
                  placeholder='Search by student name or screener...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            {/* Filter Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
              {/* Basic Filters */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Screening Result</label>
                <Select value={resultFilter} onValueChange={setResultFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='All Results' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Results</SelectItem>
                    <SelectItem value='absent'>Absent</SelectItem>
                    <SelectItem value='age_appropriate'>Age Appropriate</SelectItem>
                    <SelectItem value='complex_needs'>Complex Needs</SelectItem>
                    <SelectItem value='mild'>Mild</SelectItem>
                    <SelectItem value='mild_moderate'>Mild Moderate</SelectItem>
                    <SelectItem value='moderate'>Moderate</SelectItem>
                    <SelectItem value='monitor'>Monitor</SelectItem>
                    <SelectItem value='non_registered_no_consent'>No Consent</SelectItem>
                    <SelectItem value='passed'>Passed</SelectItem>
                    <SelectItem value='profound'>Profound</SelectItem>
                    <SelectItem value='severe'>Severe</SelectItem>
                    <SelectItem value='severe_profound'>Severe Profound</SelectItem>
                    <SelectItem value='unable_to_screen'>Unable to Screen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Date Range</label>
                <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='All Time' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Time</SelectItem>
                    <SelectItem value='today'>Today</SelectItem>
                    <SelectItem value='week'>This Week</SelectItem>
                    <SelectItem value='month'>This Month</SelectItem>
                    <SelectItem value='quarter'>This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Grade</label>
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='All Grades' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Grades</SelectItem>
                    <SelectItem value='Nursery'>Nursery</SelectItem>
                    <SelectItem value='Pre-K'>Pre-K</SelectItem>
                    <SelectItem value='K4'>K4</SelectItem>
                    <SelectItem value='K5'>K5</SelectItem>
                    <SelectItem value='Kindergarten'>Kindergarten</SelectItem>
                    <SelectItem value='K/1'>K/1</SelectItem>
                    <SelectItem value='1'>1</SelectItem>
                    <SelectItem value='1/2'>1/2</SelectItem>
                    <SelectItem value='2'>2</SelectItem>
                    <SelectItem value='2/3'>2/3</SelectItem>
                    <SelectItem value='3'>3</SelectItem>
                    <SelectItem value='3/4'>3/4</SelectItem>
                    <SelectItem value='4'>4</SelectItem>
                    <SelectItem value='4/5'>4/5</SelectItem>
                    <SelectItem value='5'>5</SelectItem>
                    <SelectItem value='5/6'>5/6</SelectItem>
                    <SelectItem value='6'>6</SelectItem>
                    <SelectItem value='6/7'>6/7</SelectItem>
                    <SelectItem value='7'>7</SelectItem>
                    <SelectItem value='7/8'>7/8</SelectItem>
                    <SelectItem value='8'>8</SelectItem>
                    <SelectItem value='8/9'>8/9</SelectItem>
                    <SelectItem value='9'>9</SelectItem>
                    <SelectItem value='9/10'>9/10</SelectItem>
                    <SelectItem value='10'>10</SelectItem>
                    <SelectItem value='10/11'>10/11</SelectItem>
                    <SelectItem value='11'>11</SelectItem>
                    <SelectItem value='11/12'>11/12</SelectItem>
                    <SelectItem value='12'>12</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Speech Program Filters */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>
                  Speech Program Qualification
                </label>
                <Select
                  value={qualifiesForSpeechProgramFilter}
                  onValueChange={setQualifiesForSpeechProgramFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='All Students' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Students</SelectItem>
                    <SelectItem value='qualifies'>Qualifies</SelectItem>
                    <SelectItem value='not_in_program'>Not in Program</SelectItem>
                    <SelectItem value='sub'>Sub</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Vocabulary Support</label>
                <Select value={vocabularySupportFilter} onValueChange={setVocabularySupportFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='All Students' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Students</SelectItem>
                    <SelectItem value='true'>Vocabulary Support Recommended</SelectItem>
                    <SelectItem value='false'>No Vocabulary Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Suspected CAS</label>
                <Select value={casFilter} onValueChange={setCasFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='All Students' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Students</SelectItem>
                    <SelectItem value='has_text'>Has CAS Notes</SelectItem>
                    <SelectItem value='no_text'>No CAS Notes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Language Comprehension</label>
                <Select
                  value={languageComprehensionFilter}
                  onValueChange={setLanguageComprehensionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='All Students' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Students</SelectItem>
                    <SelectItem value='concern'>Language Comprehension Concern</SelectItem>
                    <SelectItem value='no_concern'>No Language Comprehension Concern</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Priority Rescreen</label>
                <Select value={priorityRescreenFilter} onValueChange={setPriorityRescreenFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='All Students' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Students</SelectItem>
                    <SelectItem value='true'>Priority Rescreen Required</SelectItem>
                    <SelectItem value='false'>No Priority Rescreen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Referral Notes</label>
                <Select value={recommendationsFilter} onValueChange={setRecommendationsFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='All Students' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Students</SelectItem>
                    <SelectItem value='has_referral_notes'>Has Referral Notes</SelectItem>
                    <SelectItem value='no_referral_notes'>No Referral Notes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-700'>Clinical Notes</label>
                <Select value={clinicalNotesFilter} onValueChange={setClinicalNotesFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='All Students' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Students</SelectItem>
                    <SelectItem value='has_notes'>Has Clinical Notes</SelectItem>
                    <SelectItem value='no_notes'>No Clinical Notes</SelectItem>
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

export default ScreeningsFilters
