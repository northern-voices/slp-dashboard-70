
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LucideIcon } from 'lucide-react';
import Multiselect from '@/components/ui/multiselect';

interface FilterSectionProps {
  title: string;
  icon: LucideIcon;
  selectedCount: number;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
}

const FilterSection = ({
  title,
  icon: Icon,
  selectedCount,
  options,
  selected,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyMessage
}: FilterSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center space-x-2">
          <Icon className="w-4 h-4" />
          <span>{title} ({selectedCount} selected)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Label>Select {title}</Label>
          <Multiselect
            options={options}
            selected={selected}
            onChange={onChange}
            placeholder={placeholder}
            searchPlaceholder={searchPlaceholder}
            emptyMessage={emptyMessage}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterSection;
