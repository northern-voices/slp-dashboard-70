
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Link, 
  MessageSquare, 
  Calendar,
  Users,
  Send,
  Clock,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  reportId: number;
}

const QuickSendModal = ({ isOpen, onClose, reportTitle, reportId }: QuickSendModalProps) => {
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'link' | 'sms' | 'schedule'>('email');
  const [recipients, setRecipients] = useState('');
  const [message, setMessage] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const distributionMethods = [
    { 
      id: 'email', 
      label: 'Email', 
      icon: Mail, 
      description: 'Send via email with attachment' 
    },
    { 
      id: 'link', 
      label: 'Share Link', 
      icon: Link, 
      description: 'Generate shareable link with expiration' 
    },
    { 
      id: 'sms', 
      label: 'SMS Alert', 
      icon: MessageSquare, 
      description: 'Send notification with download link' 
    },
    { 
      id: 'schedule', 
      label: 'Schedule Send', 
      icon: Calendar, 
      description: 'Schedule for future delivery' 
    }
  ];

  const presetRecipients = [
    { label: 'All Teachers', emails: 'teachers@school.edu' },
    { label: 'Administrators', emails: 'admin@school.edu, principal@school.edu' },
    { label: 'Parents (Class 2A)', emails: 'parents-2a@school.edu' },
    { label: 'Special Education Team', emails: 'special-ed@school.edu' }
  ];

  const handleSend = async () => {
    if (!recipients && selectedMethod !== 'link') {
      toast({
        title: "Recipients Required",
        description: "Please enter recipient information",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    console.log(`Sending report ${reportId} via ${selectedMethod}`, {
      recipients,
      message,
      scheduleDate
    });

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Report Sent Successfully",
        description: `${reportTitle} has been sent via ${selectedMethod}`,
      });
      setIsSending(false);
      onClose();
      // Reset form
      setRecipients('');
      setMessage('');
      setScheduleDate('');
      setSelectedMethod('email');
    }, 1500);
  };

  const handlePresetRecipients = (emails: string) => {
    setRecipients(emails);
  };

  const generateShareLink = () => {
    const shareUrl = `${window.location.origin}/reports/shared/${reportId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Generated & Copied",
      description: "Shareable link has been copied to clipboard",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Quick Send Report
          </DialogTitle>
          <p className="text-sm text-gray-600">{reportTitle}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Distribution Method Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">Distribution Method</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {distributionMethods.map((method) => (
                <Card
                  key={method.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedMethod === method.id
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedMethod(method.id as any)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <method.icon className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-sm">{method.label}</div>
                        <div className="text-xs text-gray-600">{method.description}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recipients Section (for email/sms) */}
          {(selectedMethod === 'email' || selectedMethod === 'sms') && (
            <div>
              <Label htmlFor="recipients" className="text-base font-medium">
                Recipients {selectedMethod === 'email' ? '(Email Addresses)' : '(Phone Numbers)'}
              </Label>
              <Input
                id="recipients"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder={selectedMethod === 'email' 
                  ? "Enter email addresses separated by commas" 
                  : "Enter phone numbers separated by commas"
                }
                className="mt-2"
              />
              
              {/* Preset Recipients */}
              <div className="mt-3">
                <Label className="text-sm text-gray-600 mb-2 block">Quick Add:</Label>
                <div className="flex flex-wrap gap-2">
                  {presetRecipients.map((preset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetRecipients(preset.emails)}
                      className="text-xs"
                    >
                      <Users className="w-3 h-3 mr-1" />
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Schedule Date (for scheduled sends) */}
          {selectedMethod === 'schedule' && (
            <div>
              <Label htmlFor="scheduleDate" className="text-base font-medium">
                Schedule Date & Time
              </Label>
              <Input
                id="scheduleDate"
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="mt-2"
              />
            </div>
          )}

          {/* Share Link (for link method) */}
          {selectedMethod === 'link' && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Shareable Link Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Link expires in:</span>
                    <select className="text-sm border rounded px-2 py-1">
                      <option>7 days</option>
                      <option>30 days</option>
                      <option>90 days</option>
                      <option>Never</option>
                    </select>
                  </div>
                  <Button onClick={generateShareLink} variant="outline" size="sm" className="w-full">
                    Generate & Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Custom Message */}
          <div>
            <Label htmlFor="message" className="text-base font-medium">
              Custom Message (Optional)
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message to include with the report..."
              rows={3}
              className="mt-2"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSend}
              disabled={isSending}
              className="min-w-[120px]"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  {selectedMethod === 'schedule' ? <Clock className="w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  {selectedMethod === 'schedule' ? 'Schedule' : 'Send'} Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickSendModal;
