import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'

interface ScreeningsFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  resultFilter: string
  setResultFilter: (value: string) => void
  dateRangeFilter: string
  setDateRangeFilter: (value: string) => void
}

const ScreeningsFilters = ({
  searchTerm,
  setSearchTerm,
  resultFilter,
  setResultFilter,
  dateRangeFilter,
  setDateRangeFilter,
}: ScreeningsFiltersProps) => {
  return (
    <Card className='border-none shadow-none bg-transparent'>
      <CardContent className='p-6 px-0 py-0 bg-transparent'>
        <div className='flex flex-col lg:flex-row gap-4 bg-transparent'>
          <div className='flex flex-1 gap-4'>
            <div className='flex-1'>
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

            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Result' />
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
                <SelectItem value='non_registered_no_consent'>Non Registered/No Consent</SelectItem>
                <SelectItem value='passed'>Passed</SelectItem>
                <SelectItem value='profound'>Profound</SelectItem>
                <SelectItem value='severe'>Severe</SelectItem>
                <SelectItem value='severe_profound'>Severe Profound</SelectItem>
                <SelectItem value='unable_to_screen'>Unable to Screen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-wrap gap-4'>
            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Date Range' />
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
        </div>
      </CardContent>
    </Card>
  )
}

export default ScreeningsFilters
