import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Download, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ResponsiveTable, ResponsiveTableRow, TableHeader, TableHead, TableBody, TableCell } from '@/components/ui/responsive-table';
import { format } from 'date-fns';
import ScreeningBulkActions from './ScreeningBulkActions';
import { School } from '@/types/database';

interface Screening {
  id: string;
  studentName: string;
  type: 'speech' | 'hearing' | 'progress';
  status: 'completed' | 'in_progress' | 'scheduled' | 'cancelled';
  date: string;
  screener: string;
  result?: string;
  grade?: string;
}

interface ScreeningsTableProps {
  searchTerm: string;
  typeFilter: string;
  statusFilter: string;
  dateRangeFilter: string;
  selectedScreenings: string[];
  setSelectedScreenings: (ids: string[]) => void;
  onBulkAction: (action: string) => void;
  currentSchool: School | null;
}

const ScreeningsTable = ({
  searchTerm,
  typeFilter,
  statusFilter,
  dateRangeFilter,
  selectedScreenings,
  setSelectedScreenings,
  onBulkAction,
  currentSchool
}: ScreeningsTableProps) => {
  // Mock data filtered by current school
  const mockScreenings: Screening[] = currentSchool ? [
    {
      id: '1',
      studentName: 'Emma Johnson',
      type: 'speech',
      status: 'completed',
      date: '2024-06-01',
      screener: 'Dr. Sarah Johnson',
      result: 'P',
      grade: '3rd'
    },
    {
      id: '2',
      studentName: 'Michael Chen',
      type: 'hearing',
      status: 'completed',
      date: '2024-05-28',
      screener: 'Dr. Mike Wilson',
      result: 'M',
      grade: '6th'
    },
    {
      id: '3',
      studentName: 'Sofia Rodriguez',
      type: 'speech',
      status: 'in_progress',
      date: '2024-06-03',
      screener: 'Dr. Sarah Johnson',
      grade: '9th'
    },
    {
      id: '4',
      studentName: 'David Park',
      type: 'progress',
      status: 'scheduled',
      date: '2024-06-05',
      screener: 'Dr. Lisa Anderson',
      grade: '2nd'
    },
  ] : [];

  const filteredScreenings = mockScreenings.filter(screening => {
    const matchesSearch = screening.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         screening.screener.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || screening.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || screening.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'speech': return 'bg-purple-100 text-purple-800';
      case 'hearing': return 'bg-teal-100 text-teal-800';
      case 'progress': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultBadge = (result?: string) => {
    if (!result) return null;
    
    const resultConfig = {
      'P': { label: 'Passed', color: 'bg-green-100 text-green-800' },
      'M': { label: 'Monitor', color: 'bg-yellow-100 text-yellow-800' },
      'Q': { label: 'Qualified', color: 'bg-red-100 text-red-800' },
      'NR': { label: 'No Response', color: 'bg-blue-100 text-blue-800' },
      'NC': { label: 'No Consent', color: 'bg-orange-100 text-orange-800' },
      'C': { label: 'Complex', color: 'bg-red-100 text-red-800' }
    };

    const config = resultConfig[result as keyof typeof resultConfig];
    if (!config) return null;

    return (
      <Badge className={`${config.color} font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedScreenings(filteredScreenings.map(s => s.id));
    } else {
      setSelectedScreenings([]);
    }
  };

  const handleSelectScreening = (screeningId: string, checked: boolean) => {
    if (checked) {
      setSelectedScreenings([...selectedScreenings, screeningId]);
    } else {
      setSelectedScreenings(selectedScreenings.filter(id => id !== screeningId));
    }
  };

  const isAllSelected = filteredScreenings.length > 0 && selectedScreenings.length === filteredScreenings.length;
  const isSomeSelected = selectedScreenings.length > 0;

  if (!currentSchool) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Please select a school to view screenings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isSomeSelected && (
        <ScreeningBulkActions
          selectedCount={selectedScreenings.length}
          selectedScreenings={selectedScreenings}
          onBulkAction={onBulkAction}
          onClearSelection={() => setSelectedScreenings([])}
        />
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <ResponsiveTable>
          <TableHeader>
            <tr>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Screener</TableHead>
              <TableHead>Result</TableHead>
              <TableHead className="w-12"></TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {filteredScreenings.map((screening) => (
              <ResponsiveTableRow
                key={screening.id}
                mobileCardContent={
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedScreenings.includes(screening.id)}
                          onCheckedChange={(checked) => handleSelectScreening(screening.id, checked as boolean)}
                        />
                        <h3 className="font-medium">{screening.studentName}</h3>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(screening.type)}>
                        {screening.type.charAt(0).toUpperCase() + screening.type.slice(1)}
                      </Badge>
                      <Badge className={getStatusColor(screening.status)}>
                        {screening.status.replace('_', ' ')}
                      </Badge>
                      {getResultBadge(screening.result)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Date:</span> {format(new Date(screening.date), 'MMM d, yyyy')}</p>
                      <p><span className="font-medium">Screener:</span> {screening.screener}</p>
                    </div>
                  </div>
                }
              >
                <TableCell>
                  <Checkbox
                    checked={selectedScreenings.includes(screening.id)}
                    onCheckedChange={(checked) => handleSelectScreening(screening.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{screening.studentName}</div>
                    {screening.grade && (
                      <div className="text-sm text-gray-500">Grade {screening.grade}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getTypeColor(screening.type)}>
                    {screening.type.charAt(0).toUpperCase() + screening.type.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(screening.status)}>
                    {screening.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(screening.date), 'MMM d, yyyy')}</TableCell>
                <TableCell>{screening.screener}</TableCell>
                <TableCell>{getResultBadge(screening.result)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </ResponsiveTableRow>
            ))}
          </TableBody>
        </ResponsiveTable>

        {filteredScreenings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No screenings found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreeningsTable;
