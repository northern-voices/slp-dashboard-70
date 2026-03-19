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
import { Search, Filter, ChevronDown, ChevronUp, X } from 'lucide-react'

interface ScreeningFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  filterType: string
  setFilterType: (value: string) => void
  filterStatus: string
  setFilterStatus: (value: string) => void
  dateRangeFilter: string
  setDateRangeFilter: (value: string) => void
  qualifiesForSpeechProgramFilter: string[]
  setQualifiesForSpeechProgramFilter: (value: string[]) => void
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

const ScreeningFilters = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
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
}: ScreeningFiltersProps) => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm ||
    filterType !== 'all' ||
    filterStatus !== 'all' ||
    dateRangeFilter !== 'all' ||
    qualifiesForSpeechProgramFilter.length > 0 ||
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
    setFilterType('all')
    setFilterStatus('all')
    setDateRangeFilter('all')
    setQualifiesForSpeechProgramFilter([])
    setVocabularySupportFilter('all')
    setCasFilter('all')
    setGradeFilter('all')
    setRecommendationsFilter('all')
    setClinicalNotesFilter('all')
    setLanguageComprehensionFilter('all')
    setPriorityRescreenFilter('all')
  }

  // Get active filter counts
  const getActiveFilterCount = () => {
    let count = 0
    if (searchTerm) count++
    if (filterType !== 'all') count++
    if (filterStatus !== 'all') count++
    if (dateRangeFilter !== 'all') count++
    if (qualifiesForSpeechProgramFilter.length > 0) count++
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
    <div className='space-y-4'>
      {/* Search Bar */}
      <div className='mb-6 mt-5'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          <Input
            placeholder='Search by screener name...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      <Card className='border border-gray-200 shadow-sm mb-6'>
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
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-700'>Screening Type</label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder='All Types' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Types</SelectItem>
                      <SelectItem value='speech'>Speech</SelectItem>
                      <SelectItem value='hearing'>Hearing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-700'>Screening Result</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder='All Results' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Results</SelectItem>
                      <SelectItem value='no_errors'>No Errors</SelectItem>
                      <SelectItem value='age_appropriate'>Age Appropriate</SelectItem>
                      <SelectItem value='monitor'>Monitor</SelectItem>
                      <SelectItem value='mild'>Mild</SelectItem>
                      <SelectItem value='moderate'>Moderate</SelectItem>
                      <SelectItem value='severe'>Severe</SelectItem>
                      <SelectItem value='profound'>Profound</SelectItem>
                      <SelectItem value='complex_needs'>Complex Needs</SelectItem>
                      <SelectItem value='unable_to_screen'>Non-Compliant</SelectItem>
                      <SelectItem value='absent'>Absent</SelectItem>
                      <SelectItem value='non_registered_no_consent'>No Consent</SelectItem>
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
                      <SelectItem value='school_year'>This School Year</SelectItem>
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
                      <SelectItem value='Headstart'>Headstart</SelectItem>
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

                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-700'>
                    Speech Program Qualification
                  </label>
                  <div className='space-y-1'>
                    {[
                      { value: 'qualified', label: 'Qualifies' },
                      { value: 'not_in_program', label: 'Not in Program' },
                      { value: 'sub', label: 'Sub' },
                      { value: 'paused', label: 'Pause/Away' },
                      { value: 'graduated', label: 'Graduated' },
                      { value: 'no_consent', label: 'No Consent' },
                    ].map(option => (
                      <div key={option.value} className='flex items-center space-x-2'>
                        <input
                          type='checkbox'
                          id={`qual_${option.value}`}
                          checked={qualifiesForSpeechProgramFilter.includes(option.value)}
                          onChange={e => {
                            if (e.target.checked) {
                              setQualifiesForSpeechProgramFilter([
                                ...qualifiesForSpeechProgramFilter,
                                option.value,
                              ])
                            } else {
                              setQualifiesForSpeechProgramFilter(
                                qualifiesForSpeechProgramFilter.filter(v => v !== option.value)
                              )
                            }
                          }}
                          className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                        />
                        <label
                          htmlFor={`qual_${option.value}`}
                          className='text-sm text-gray-700 cursor-pointer'>
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Filters Section */}
              <div className='border-t border-gray-200 pt-4'>
                <h4 className='text-sm font-semibold text-gray-700 mb-3'>Quick Filters</h4>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                  <div className='flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors'>
                    <input
                      type='checkbox'
                      id='vocabulary_support_filter'
                      checked={vocabularySupportFilter === 'true'}
                      onChange={e => setVocabularySupportFilter(e.target.checked ? 'true' : 'all')}
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    />
                    <label
                      htmlFor='vocabulary_support_filter'
                      className='text-sm font-medium text-gray-700 cursor-pointer'>
                      Vocabulary Support Recommended
                    </label>
                  </div>

                  <div className='flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors'>
                    <input
                      type='checkbox'
                      id='cas_filter'
                      checked={casFilter === 'has_text'}
                      onChange={e => setCasFilter(e.target.checked ? 'has_text' : 'all')}
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    />
                    <label
                      htmlFor='cas_filter'
                      className='text-sm font-medium text-gray-700 cursor-pointer'>
                      Has Suspected CAS Notes
                    </label>
                  </div>

                  <div className='flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors'>
                    <input
                      type='checkbox'
                      id='language_comprehension_filter'
                      checked={languageComprehensionFilter === 'concern'}
                      onChange={e =>
                        setLanguageComprehensionFilter(e.target.checked ? 'concern' : 'all')
                      }
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    />
                    <label
                      htmlFor='language_comprehension_filter'
                      className='text-sm font-medium text-gray-700 cursor-pointer'>
                      Has Language Comprehension Concern
                    </label>
                  </div>

                  <div className='flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors'>
                    <input
                      type='checkbox'
                      id='priority_rescreen_filter'
                      checked={priorityRescreenFilter === 'true'}
                      onChange={e => setPriorityRescreenFilter(e.target.checked ? 'true' : 'all')}
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    />
                    <label
                      htmlFor='priority_rescreen_filter'
                      className='text-sm font-medium text-gray-700 cursor-pointer'>
                      Priority Rescreen Required
                    </label>
                  </div>

                  <div className='flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors'>
                    <input
                      type='checkbox'
                      id='referral_notes_filter'
                      checked={recommendationsFilter === 'has_referral_notes'}
                      onChange={e =>
                        setRecommendationsFilter(e.target.checked ? 'has_referral_notes' : 'all')
                      }
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
                      id='clinical_notes_filter'
                      checked={clinicalNotesFilter === 'has_notes'}
                      onChange={e => setClinicalNotesFilter(e.target.checked ? 'has_notes' : 'all')}
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    />
                    <label
                      htmlFor='clinical_notes_filter'
                      className='text-sm font-medium text-gray-700 cursor-pointer'>
                      Has Clinical Notes
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

export default ScreeningFilters
