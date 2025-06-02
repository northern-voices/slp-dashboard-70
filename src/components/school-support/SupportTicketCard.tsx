
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, School, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { SchoolSupportForm, SUPPORT_TYPE_LABELS, SUPPORT_STATUS_LABELS, SUPPORT_PRIORITY_LABELS } from '@/types/student-enhancements';

interface SupportTicketCardProps {
  ticket: SchoolSupportForm;
  onViewDetails: (ticket: SchoolSupportForm) => void;
}

const SupportTicketCard = ({ ticket, onViewDetails }: SupportTicketCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{ticket.student_name}</h3>
              <Badge className={getStatusColor(ticket.status)}>
                {SUPPORT_STATUS_LABELS[ticket.status]}
              </Badge>
              <Badge className={getPriorityColor(ticket.priority)}>
                {SUPPORT_PRIORITY_LABELS[ticket.priority]}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <School className="w-4 h-4" />
                {ticket.school_name}
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {ticket.slp_names?.join(', ')}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(ticket)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {format(new Date(ticket.start_date), 'MMM d')} - {format(new Date(ticket.end_date), 'MMM d, yyyy')}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Created {format(new Date(ticket.created_at), 'MMM d, yyyy')}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {ticket.support_types.map((type) => (
              <Badge key={type} variant="outline" className="text-xs">
                {SUPPORT_TYPE_LABELS[type]}
              </Badge>
            ))}
          </div>
          
          <p className="text-sm text-gray-700 line-clamp-2">
            {ticket.notes}
          </p>
          
          {ticket.follow_up && ticket.follow_up_date && (
            <div className="text-xs text-blue-600 font-medium">
              Follow-up: {format(new Date(ticket.follow_up_date), 'MMM d, yyyy')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportTicketCard;
