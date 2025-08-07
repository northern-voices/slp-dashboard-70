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
import { Search, Filter, ChevronDown, ChevronUp, X, RefreshCw, Zap } from 'lucide-react'

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

  // Quick filter presets
  const applyQuickFilter = (preset: string) => {
    clearAllFilters()
    switch (preset) {
      case 'qualified':
        setQualifiesForSpeechProgramFilter('true')
        break
      case 'needs_attention':
        setResultFilter('moderate')
        setPriorityRescreenFilter('true')
        break
      case 'recent':
        setDateRangeFilter('week')
        break
      case 'no_notes':
        setClinicalNotesFilter('no_notes')
        break
    }
  }

  return (
    <Card className='border border-gray-200 shadow-sm'>
      <Collapsible open={isFiltersExpanded} onOpenChange={setIsFiltersExpanded}>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Filter className='w-5 h-5 text-gray-600' />
              <CardTitle className='text-lg font-semibold'>Filters</CardTitle>
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

            {/* Quick Filters */}
            <div className='mb-6'>
              <div className='flex items-center gap-2 mb-3'>
                <Zap className='w-4 h-4 text-yellow-500' />
                <span className='text-sm font-medium text-gray-700'>Quick Filters</span>
              </div>
              <div className='flex flex-wrap gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => applyQuickFilter('qualified')}
                  className='text-xs'>
                  Qualified Students
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => applyQuickFilter('needs_attention')}
                  className='text-xs'>
                  Needs Attention
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => applyQuickFilter('recent')}
                  className='text-xs'>
                  Recent Screenings
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => applyQuickFilter('no_notes')}
                  className='text-xs'>
                  Missing Notes
                </Button>
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
                    <SelectItem value='non_registered_no_consent'>
                      Non Registered/No Consent
                    </SelectItem>
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
                    <SelectItem value='K'>Kindergarten</SelectItem>
                    <SelectItem value='1'>1st Grade</SelectItem>
                    <SelectItem value='2'>2nd Grade</SelectItem>
                    <SelectItem value='3'>3rd Grade</SelectItem>
                    <SelectItem value='4'>4th Grade</SelectItem>
                    <SelectItem value='5'>5th Grade</SelectItem>
                    <SelectItem value='6'>6th Grade</SelectItem>
                    <SelectItem value='7'>7th Grade</SelectItem>
                    <SelectItem value='8'>8th Grade</SelectItem>
                    <SelectItem value='9'>9th Grade</SelectItem>
                    <SelectItem value='10'>10th Grade</SelectItem>
                    <SelectItem value='11'>11th Grade</SelectItem>
                    <SelectItem value='12'>12th Grade</SelectItem>
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
                    <SelectValue placeholder='Show All Students' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Show All Students</SelectItem>
                    <SelectItem value='true'>Qualified for Speech Program</SelectItem>
                    <SelectItem value='false'>Not Qualified for Speech Program</SelectItem>
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
                    <SelectItem value='true'>Suspected CAS</SelectItem>
                    <SelectItem value='false'>No CAS Suspected</SelectItem>
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
                <label className='text-sm font-medium text-gray-700'>
                  Recommendations & Referrals
                </label>
                <Select value={recommendationsFilter} onValueChange={setRecommendationsFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='All Students' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Students</SelectItem>
                    <SelectItem value='has_recommendations'>Has Recommendations</SelectItem>
                    <SelectItem value='has_referrals'>Has Referrals</SelectItem>
                    <SelectItem value='none'>No Recommendations/Referrals</SelectItem>
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
