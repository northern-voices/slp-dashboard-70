
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { SUPPORT_STATUS_LABELS, SUPPORT_PRIORITY_LABELS } from '@/types/student-enhancements';
import { mockSchools } from '@/data/mockSchoolSupport';

interface SupportTicketFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  schoolFilter: string;
  setSchoolFilter: (school: string) => void;
}

const SupportTicketFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  schoolFilter,
  setSchoolFilter,
}: SupportTicketFiltersProps) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by student name, SLP, or notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(SUPPORT_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Priorities</SelectItem>
            {Object.entries(SUPPORT_PRIORITY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={schoolFilter} onValueChange={setSchoolFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Schools" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Schools</SelectItem>
            {mockSchools.map((school) => (
              <SelectItem key={school} value={school}>
                {school}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SupportTicketFilters;
