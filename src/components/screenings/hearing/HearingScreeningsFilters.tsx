import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'

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
  return (
    <Card className='p-6'>
      <div className='space-y-4'>
        <div className='flex items-center gap-2 mb-4'>
          <Filter className='w-5 h-5 text-gray-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Filters</h3>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Search */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <Input
              type='text'
              placeholder='Search students or screeners...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>

          {/* Date Range Filter */}
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

          {/* Grade Filter */}
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
    </Card>
  )
}

export default HearingScreeningsFilters
