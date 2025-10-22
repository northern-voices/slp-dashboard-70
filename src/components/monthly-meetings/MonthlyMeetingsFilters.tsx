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
import { useGetUsers } from '@/hooks/users/use-users'

interface MonthlyMeetingsFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  dateRangeFilter: string
  setDateRangeFilter: (value: string) => void
  facilitatorFilter: string
  setFacilitatorFilter: (value: string) => void
}

const MonthlyMeetingsFilters = ({
  searchTerm,
  setSearchTerm,
  dateRangeFilter,
  setDateRangeFilter,
  facilitatorFilter,
  setFacilitatorFilter,
}: MonthlyMeetingsFiltersProps) => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)
  const { data: users = [], isLoading: isLoadingUsers } = useGetUsers()

  // Check if any filters are active
  const hasActiveFilters = searchTerm || dateRangeFilter !== 'all' || facilitatorFilter !== 'all'

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('')
    setDateRangeFilter('all')
    setFacilitatorFilter('all')
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (searchTerm) count++
    if (dateRangeFilter !== 'all') count++
    if (facilitatorFilter !== 'all') count++
    return count
  }

  return (
    <div className='space-y-4'>
      {/* Search Bar - Always Visible */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
        <Input
          placeholder='Search by meeting title or participant...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='pl-10'
        />
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
                  <label className='text-sm font-medium text-gray-700'>Facilitator</label>
                  <Select
                    value={facilitatorFilter}
                    onValueChange={setFacilitatorFilter}
                    disabled={isLoadingUsers}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={isLoadingUsers ? 'Loading...' : 'All Facilitators'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Facilitators</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name}
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
    </div>
  )
}

export default MonthlyMeetingsFilters
