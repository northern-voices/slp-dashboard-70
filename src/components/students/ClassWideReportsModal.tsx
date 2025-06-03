import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ClassWideHearingForm from '@/components/reports/ClassWideHearingForm';
import ClassWideSpeechForm from '@/components/reports/ClassWideSpeechForm';

interface ClassWideReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ClassWideReportsModal = ({ isOpen, onClose }: ClassWideReportsModalProps) => {
  const [activeTab, setActiveTab] = useState('hearing');
  const [email, setEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendReports = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter a recipient email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate sending email
    setTimeout(() => {
      console.log('Sending class-wide reports:', {
        reportType: activeTab,
        email,
        customMessage
      });
      
      setIsSubmitted(true);
      setIsLoading(false);
      
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
        // Reset form
        setEmail('');
        setCustomMessage('');
        setActiveTab('hearing');
      }, 2000);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports Sent Successfully!</h3>
            <p className="text-gray-600">The class-wide reports have been sent to {email}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Mail className="w-5 h-5" />
            Send Class-Wide Reports
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="w-full justify-start flex-nowrap h-auto p-1 min-w-max">
                <TabsTrigger value="hearing" className="flex-shrink-0 whitespace-nowrap">Hearing</TabsTrigger>
                <TabsTrigger value="speech-screens" className="flex-shrink-0 whitespace-nowrap">Speech Screens</TabsTrigger>
                <TabsTrigger value="goal-sheets" className="flex-shrink-0 whitespace-nowrap">Goal Sheets</TabsTrigger>
                <TabsTrigger value="progress" className="flex-shrink-0 whitespace-nowrap">Progress</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="hearing" className="mt-6">
              <ClassWideHearingForm />
            </TabsContent>

            <TabsContent value="speech-screens" className="mt-6">
              <ClassWideSpeechForm 
                title="Class Wide Speech Screens" 
                reportType="screens" 
              />
            </TabsContent>

            <TabsContent value="goal-sheets" className="mt-6">
              <ClassWideSpeechForm 
                title="Class Wide Goal Sheets" 
                reportType="goals" 
              />
            </TabsContent>

            <TabsContent value="progress" className="mt-6">
              <ClassWideSpeechForm 
                title="Class Wide Progress Reports" 
                reportType="progress" 
              />
            </TabsContent>
          </Tabs>

          {/* Email Composition Section */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Email Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipient-email">Recipient Email *</Label>
                <Input
                  id="recipient-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter recipient email address"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="custom-message">Custom Message</Label>
              <Textarea
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personal message to include with the reports..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendReports}
              disabled={isLoading || !email}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Reports
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClassWideReportsModal;
