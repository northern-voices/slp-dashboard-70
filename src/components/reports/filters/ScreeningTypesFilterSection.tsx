
import React from 'react';
import { Stethoscope } from 'lucide-react';
import FilterSection from './FilterSection';

interface ScreeningTypesFilterSectionProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

const ScreeningTypesFilterSection = ({ selected, onChange }: ScreeningTypesFilterSectionProps) => {
  const screeningTypeOptions = [
    'Speech Screening',
    'Hearing Screening',
    'Language Assessment',
    'Articulation Test',
    'Fluency Evaluation'
  ];

  return (
    <FilterSection
      title="Screening Types"
      icon={Stethoscope}
      selectedCount={selected.length}
      options={screeningTypeOptions}
      selected={selected}
      onChange={onChange}
      placeholder="Select screening types..."
      searchPlaceholder="Search screening types..."
      emptyMessage="No screening types found."
    />
  );
};

export default ScreeningTypesFilterSection;
