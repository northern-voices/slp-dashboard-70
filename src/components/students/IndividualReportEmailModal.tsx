
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Student } from '@/types/database';
import { Mail, Send } from 'lucide-react';
import Multiselect from '@/components/ui/multiselect';

interface IndividualReportEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

const IndividualReportEmailModal = ({ isOpen, onClose, student }: IndividualReportEmailModalProps) => {
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const availableReports = [
    'Hearing Screen Report',
    'Speech Screen Report',
    'Goal Sheet',
    'Progress Report'
  ];

  const handleSendEmail = async () => {
    if (!recipientEmail || selectedReports.length === 0) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate email sending
      console.log('Sending individual reports email:', {
        student: student,
        recipient: recipientEmail,
        reports: selectedReports,
        message: customMessage
      });
      
      // TODO: Implement actual email sending logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onClose();
      // Reset form
      setSelectedReports([]);
      setRecipientEmail('');
      setCustomMessage('');
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const defaultSubject = `Reports for ${student.first_name} ${student.last_name}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send {student.first_name}'s Reports
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Select Reports to Send</Label>
            <Multiselect
              options={availableReports}
              selected={selectedReports}
              onChange={setSelectedReports}
              placeholder="Select reports to send..."
              searchPlaceholder="Search reports..."
              emptyMessage="No reports found."
            />
          </div>

          {/* Email Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Email</Label>
              <Input
                id="recipient"
                type="email"
                placeholder="Enter recipient email address"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={defaultSubject}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Custom Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message to include with the reports..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendEmail}
              disabled={!recipientEmail || selectedReports.length === 0 || isLoading}
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? 'Sending...' : 'Send Reports'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IndividualReportEmailModal;
