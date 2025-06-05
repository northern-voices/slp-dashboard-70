import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
interface ScreeningsFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  schoolFilter: string;
  setSchoolFilter: (value: string) => void;
  dateRangeFilter: string;
  setDateRangeFilter: (value: string) => void;
}
const ScreeningsFilters = ({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  schoolFilter,
  setSchoolFilter,
  dateRangeFilter,
  setDateRangeFilter
}: ScreeningsFiltersProps) => {
  return <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-6 px-0 py-0 bg-transparent">
        <div className="flex flex-col lg:flex-row gap-4 bg-transparent">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search by student name, screener, or school..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="speech">Speech</SelectItem>
                <SelectItem value="hearing">Hearing</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={schoolFilter} onValueChange={setSchoolFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="School" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                <SelectItem value="lincoln-elementary">Lincoln Elementary</SelectItem>
                <SelectItem value="washington-middle">Washington Middle School</SelectItem>
                <SelectItem value="jefferson-high">Jefferson High School</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default ScreeningsFilters;