
import React from 'react';
import { Filter } from 'lucide-react';
import { SchoolSupportForm } from '@/types/student-enhancements';
import SupportTicketCard from './SupportTicketCard';

interface SupportTicketsListProps {
  tickets: SchoolSupportForm[];
  hasFilters: boolean;
  onViewDetails: (ticket: SchoolSupportForm) => void;
}

const SupportTicketsList = ({ tickets, hasFilters, onViewDetails }: SupportTicketsListProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Support Tickets ({tickets.length})</h3>
      </div>
      
      {tickets.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 rounded-lg">
          <div className="text-gray-400 mb-4">
            <Filter className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Support Tickets Found</h3>
          <p className="text-gray-600">
            {hasFilters
              ? 'Try adjusting your filters or search terms.'
              : 'No support tickets have been created yet.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <SupportTicketCard
              key={ticket.id}
              ticket={ticket}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportTicketsList;
