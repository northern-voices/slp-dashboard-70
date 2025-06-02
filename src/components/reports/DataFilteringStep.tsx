
import React from 'react';
import { ScheduleReportData } from './ScheduleReportsModal';
import DataFilteringHeader from './filters/DataFilteringHeader';
import SchoolsFilterSection from './filters/SchoolsFilterSection';
import GradesFilterSection from './filters/GradesFilterSection';
import ScreeningTypesFilterSection from './filters/ScreeningTypesFilterSection';

interface DataFilteringStepProps {
  formData: ScheduleReportData;
  updateFormData: (updates: Partial<ScheduleReportData>) => void;
}

const DataFilteringStep = ({ formData, updateFormData }: DataFilteringStepProps) => {
  return (
    <div className="space-y-6">
      <DataFilteringHeader />

      <SchoolsFilterSection
        selected={formData.schools}
        onChange={(selected) => updateFormData({ schools: selected })}
      />

      <GradesFilterSection
        selected={formData.grades}
        onChange={(selected) => updateFormData({ grades: selected })}
      />

      <ScreeningTypesFilterSection
        selected={formData.screeningTypes}
        onChange={(selected) => updateFormData({ screeningTypes: selected })}
      />
    </div>
  );
};

export default DataFilteringStep;
