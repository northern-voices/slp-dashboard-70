
import React from 'react';
import { Users } from 'lucide-react';
import FilterSection from './FilterSection';

interface GradesFilterSectionProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

const GradesFilterSection = ({ selected, onChange }: GradesFilterSectionProps) => {
  const gradeOptions = [
    'Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade',
    '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade',
    '9th Grade', '10th Grade', '11th Grade', '12th Grade'
  ];

  return (
    <FilterSection
      title="Grade Levels"
      icon={Users}
      selectedCount={selected.length}
      options={gradeOptions}
      selected={selected}
      onChange={onChange}
      placeholder="Select grade levels..."
      searchPlaceholder="Search grades..."
      emptyMessage="No grades found."
    />
  );
};

export default GradesFilterSection;
