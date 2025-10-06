import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, ChevronDown, ChevronUp, X } from 'lucide-react'

interface StudentTableFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
}

const StudentTableFilters = ({ searchTerm, setSearchTerm }: StudentTableFiltersProps) => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)

  // Check if any filters are active
  const hasActiveFilters = searchTerm

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('')
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (searchTerm) count++
    return count
  }

  return (
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
            {/* Search Bar */}
            <div className='mb-6 mt-5'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <Input
                  placeholder='Search students by name or ID...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            {/* Additional filters will go here */}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default StudentTableFilters
