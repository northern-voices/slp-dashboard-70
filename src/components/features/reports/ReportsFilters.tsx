
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface ReportsFiltersProps {
  selectedTimeframe: string;
  setSelectedTimeframe: (value: string) => void;
  selectedReportType: string;
  setSelectedReportType: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const ReportsFilters = ({
  selectedTimeframe,
  setSelectedTimeframe,
  selectedReportType,
  setSelectedReportType,
  searchTerm,
  setSearchTerm
}: ReportsFiltersProps) => {
  return (
    <div className="mb-8">
      <h3 className="text-xl text-gray-900 mb-4 font-medium">Search Reports</h3>
      
      <div className="flex flex-col gap-4">
        {/* Search Input - Full width on mobile */}
        <div className="w-full">
          <Input 
            placeholder="e.g., John Doe" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="h-11 w-full" 
          />
        </div>
        
        {/* Filter Row - Stack on mobile, row on larger screens */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Timeframe Select */}
          <div className="w-full sm:w-auto sm:min-w-[180px]">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Last Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Report Type Select */}
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <Select value={selectedReportType} onValueChange={setSelectedReportType}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Individual Reports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="summary">Summary Reports</SelectItem>
                <SelectItem value="individual">Individual Reports</SelectItem>
                <SelectItem value="progress">Progress Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Apply Filters Button */}
          <Button className="h-11 w-full sm:w-auto sm:px-6 flex-shrink-0">
            <Filter className="w-4 h-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportsFilters;
