import React from 'react'
import { School } from 'lucide-react'
import FilterSection from './FilterSection'

interface SchoolsFilterSectionProps {
  selected: string[]
  onChange: (selected: string[]) => void
}

const SchoolsFilterSection = ({ selected, onChange }: SchoolsFilterSectionProps) => {
  const mockSchools = [
    'Lincoln Elementary',
    'Washington Middle School',
    'Roosevelt High School',
    'Jefferson Academy',
  ]

  return (
    <FilterSection
      title='Schools'
      icon={School}
      selectedCount={selected.length}
      options={mockSchools}
      selected={selected}
      onChange={onChange}
      placeholder='Select schools... asfasf'
      searchPlaceholder='Search schools...'
      emptyMessage='No schools found.'
    />
  )
}

export default SchoolsFilterSection
