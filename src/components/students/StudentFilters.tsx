
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Student } from '@/types/database';

interface StudentFiltersProps {
  students: Student[];
  onFilter: (filteredStudents: Student[]) => void;
}

const StudentFilters = ({ students, onFilter }: StudentFiltersProps) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('');

  // Get unique values for filter options
  const grades = Array.from(new Set(students.map(s => s.grade).filter(Boolean))).sort();
  const activeFilters = [
    selectedGrade && { type: 'Grade', value: selectedGrade, clear: () => setSelectedGrade('') },
    selectedStatus && { type: 'Status', value: selectedStatus, clear: () => setSelectedStatus('') },
    selectedGender && { type: 'Gender', value: selectedGender, clear: () => setSelectedGender('') },
  ].filter(Boolean);

  useEffect(() => {
    let filtered = [...students];

    if (selectedGrade) {
      filtered = filtered.filter(student => student.grade === selectedGrade);
    }

    if (selectedStatus) {
      const isActive = selectedStatus === 'active';
      filtered = filtered.filter(student => student.active === isActive);
    }

    if (selectedGender) {
      filtered = filtered.filter(student => student.gender === selectedGender);
    }

    onFilter(filtered);
  }, [selectedGrade, selectedStatus, selectedGender, students, onFilter]);

  const clearAllFilters = () => {
    setSelectedGrade('');
    setSelectedStatus('');
    setSelectedGender('');
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All grades" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Active filters:</span>
              {activeFilters.map((filter) => (
                <Badge key={filter.type} variant="secondary" className="flex items-center gap-1">
                  {filter.type}: {filter.value}
                  <button
                    onClick={filter.clear}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentFilters;
