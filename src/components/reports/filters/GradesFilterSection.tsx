import React from 'react'
import { Users } from 'lucide-react'
import FilterSection from './FilterSection'

interface GradesFilterSectionProps {
  selected: string[]
  onChange: (selected: string[]) => void
}

const GradesFilterSection = ({ selected, onChange }: GradesFilterSectionProps) => {
  const gradeOptions = [
    'Headstart',
    'Nursery',
    'Pre-K',
    'K4',
    'K5',
    'Kindergarten',
    'K/1',
    '1st Grade',
    '1/2',
    '2nd Grade',
    '2/3',
    '3rd Grade',
    '3/4',
    '4th Grade',
    '4/5',
    '5th Grade',
    '5/6',
    '6th Grade',
    '6/7',
    '7th Grade',
    '7/8',
    '8th Grade',
    '8/9',
    '9th Grade',
    '9/10',
    '10th Grade',
    '10/11',
    '11th Grade',
    '11/12',
    '12th Grade',
  ]

  return (
    <FilterSection
      title='Grade Levels'
      icon={Users}
      selectedCount={selected.length}
      options={gradeOptions}
      selected={selected}
      onChange={onChange}
      placeholder='Select grade levels...'
      searchPlaceholder='Search grades...'
      emptyMessage='No grades found.'
    />
  )
}

export default GradesFilterSection
