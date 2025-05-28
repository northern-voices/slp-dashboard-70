
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

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
    <div className="space-y-4 mb-6">
      {/* Row 1: Timeframe and Report Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="timeframe" className="text-sm font-medium">Timeframe</Label>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="report_type" className="text-sm font-medium">Report Type</Label>
          <Select value={selectedReportType} onValueChange={setSelectedReportType}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="summary">Summary Reports</SelectItem>
              <SelectItem value="individual">Individual Reports</SelectItem>
              <SelectItem value="progress">Progress Reports</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">Search Reports</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="search"
            placeholder="Search by student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {/* Row 3: Apply Filters Button */}
      <Button className="w-full h-11">
        <Filter className="w-4 h-4 mr-2" />
        Apply Filters
      </Button>
    </div>
  );
};

export default ReportsFilters;
