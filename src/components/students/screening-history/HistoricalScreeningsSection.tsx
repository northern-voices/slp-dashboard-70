
import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { Screening } from '@/types/database';
import ScreeningTableRow from './ScreeningTableRow';

interface HistoricalScreeningsSectionProps {
  groupedHistorical: Record<number, Screening[]>;
  openSections: string[];
  toggleSection: (section: string) => void;
}

const HistoricalScreeningsSection = ({ 
  groupedHistorical, 
  openSections, 
  toggleSection 
}: HistoricalScreeningsSectionProps) => {
  if (Object.keys(groupedHistorical).length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Historical Screenings
      </h3>
      <div className="space-y-2">
        {Object.entries(groupedHistorical)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([year, yearScreenings]) => (
            <Collapsible
              key={year}
              open={openSections.includes(year)}
              onOpenChange={() => toggleSection(year)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                <span className="font-medium text-gray-900">
                  {year} ({yearScreenings.length} screening{yearScreenings.length !== 1 ? 's' : ''})
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${
                  openSections.includes(year) ? 'rotate-180' : ''
                }`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium text-gray-700">Type</th>
                        <th className="text-left p-4 font-medium text-gray-700">Date</th>
                        <th className="text-left p-4 font-medium text-gray-700">Notes</th>
                        <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearScreenings.map(screening => (
                        <ScreeningTableRow key={screening.id} screening={screening} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
      </div>
    </div>
  );
};

export default HistoricalScreeningsSection;
