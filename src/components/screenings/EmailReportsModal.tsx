
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Users, UserCheck, Building } from 'lucide-react';

interface EmailReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedScreenings: string[];
  onSend: (action: string) => void;
}

const EmailReportsModal = ({ isOpen, onClose, selectedScreenings, onSend }: EmailReportsModalProps) => {
  const [recipients, setRecipients] = useState({
    teachers: true,
    administrators: false,
    parents: false
  });
  const [customEmails, setCustomEmails] = useState('');
  const [subject, setSubject] = useState(`Screening Reports - ${new Date().toLocaleDateString()}`);
  const [message, setMessage] = useState(`Please find attached the screening reports for ${selectedScreenings.length} student${selectedScreenings.length > 1 ? 's' : ''}.\n\nBest regards,\nScreening Team`);
  const [attachIndividualReports, setAttachIndividualReports] = useState(true);
  const [attachSummaryReport, setAttachSummaryReport] = useState(true);

  const handleSend = () => {
    console.log('Sending email reports:', {
      recipients,
      customEmails,
      subject,
      message,
      selectedScreenings,
      attachIndividualReports,
      attachSummaryReport
    });

    // In a real implementation, this would send emails via backend/Supabase
    onSend('email');
    onClose();
  };

  const recipientOptions = [
    { key: 'teachers', label: 'Teachers', icon: UserCheck, description: 'Send to classroom teachers' },
    { key: 'administrators', label: 'Administrators', icon: Building, description: 'Send to school administrators' },
    { key: 'parents', label: 'Parents/Guardians', icon: Users, description: 'Send to student parents/guardians' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Screening Reports</DialogTitle>
          <DialogDescription>
            Send reports for {selectedScreenings.length} selected screening{selectedScreenings.length > 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block">Recipients</label>
            <div className="space-y-3">
              {recipientOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.key}
                      checked={recipients[option.key as keyof typeof recipients]}
                      onCheckedChange={(checked) =>
                        setRecipients(prev => ({ ...prev, [option.key]: checked === true }))
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <div>
                        <label htmlFor={option.key} className="text-sm font-medium">{option.label}</label>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="custom-emails" className="text-sm font-medium mb-2 block">
              Additional Email Addresses
            </label>
            <Input
              id="custom-emails"
              placeholder="email1@example.com, email2@example.com"
              value={customEmails}
              onChange={(e) => setCustomEmails(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
          </div>

          <div>
            <label htmlFor="subject" className="text-sm font-medium mb-2 block">Subject</label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="message" className="text-sm font-medium mb-2 block">Message</label>
            <Textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Attachments</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="individual"
                  checked={attachIndividualReports}
                  onCheckedChange={(checked) => setAttachIndividualReports(checked === true)}
                />
                <label htmlFor="individual" className="text-sm">Individual screening reports</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="summary"
                  checked={attachSummaryReport}
                  onCheckedChange={(checked) => setAttachSummaryReport(checked === true)}
                />
                <label htmlFor="summary" className="text-sm">Summary report</label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSend}>
              <Mail className="w-4 h-4 mr-2" />
              Send Reports
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailReportsModal;
