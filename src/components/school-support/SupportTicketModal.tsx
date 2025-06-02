
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, School, Clock, FileText, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { SchoolSupportForm, SUPPORT_TYPE_LABELS, SUPPORT_STATUS_LABELS, SUPPORT_PRIORITY_LABELS } from '@/types/student-enhancements';

interface SupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: SchoolSupportForm | null;
}

const SupportTicketModal = ({ isOpen, onClose, ticket }: SupportTicketModalProps) => {
  if (!ticket) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Support Ticket Details</span>
            <Badge className={getStatusColor(ticket.status)}>
              {SUPPORT_STATUS_LABELS[ticket.status]}
            </Badge>
            <Badge className={getPriorityColor(ticket.priority)}>
              {SUPPORT_PRIORITY_LABELS[ticket.priority]}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Student and School Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Student Information</h3>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-500" />
                <span>{ticket.student_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <School className="w-4 h-4 text-gray-500" />
                <span>{ticket.school_name}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Assigned SLPs</h3>
              {ticket.slp_names?.map((slp, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>{slp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>Start: {format(new Date(ticket.start_date), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>End: {format(new Date(ticket.end_date), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>Created: {format(new Date(ticket.created_at), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>Updated: {format(new Date(ticket.updated_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          {/* Support Types */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Support Types</h3>
            <div className="flex flex-wrap gap-2">
              {ticket.support_types.map((type) => (
                <Badge key={type} variant="outline">
                  {SUPPORT_TYPE_LABELS[type]}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notes
            </h3>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
              {ticket.notes}
            </p>
          </div>

          {/* Follow-up */}
          {ticket.follow_up && ticket.follow_up_date && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Follow-up Required
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>Follow-up Date: {format(new Date(ticket.follow_up_date), 'MMM d, yyyy')}</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportTicketModal;
