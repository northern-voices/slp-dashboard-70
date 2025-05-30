
import React from 'react';
import { Screening } from '@/types/database';
import ScreeningTableRow from './ScreeningTableRow';

interface ScreeningTableProps {
  screenings: Screening[];
  title: string;
  emptyMessage?: string;
}

const ScreeningTable = ({ screenings, title, emptyMessage = "No screenings found." }: ScreeningTableProps) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-3">
      {title}
    </h3>
    {screenings.length > 0 ? (
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
            {screenings.map(screening => (
              <ScreeningTableRow key={screening.id} screening={screening} />
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="text-gray-500 text-sm">{emptyMessage}</p>
    )}
  </div>
);

export default ScreeningTable;
