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
  return <div className="mb-8">
      <h3 className="text-xl text-gray-900 mb-4 font-medium">Search Reports</h3>
      
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1">
          <Input placeholder="e.g., John Doe" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="h-11" />
        </div>
        
        <div className="w-full lg:w-48">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="h-11">
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
        
        <div className="w-full lg:w-52">
          <Select value={selectedReportType} onValueChange={setSelectedReportType}>
            <SelectTrigger className="h-11">
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
        
        <Button className="h-11 px-6">
          <Filter className="w-4 h-4 mr-2" />
          Apply Filters
        </Button>
      </div>
    </div>;
};
export default ReportsFilters;