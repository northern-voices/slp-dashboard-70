import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Mail, X, Users } from 'lucide-react';
import { ScheduleReportData } from '../ScheduleReportsModal';

interface RecipientsStepProps {
  formData: ScheduleReportData;
  updateFormData: (updates: Partial<ScheduleReportData>) => void;
}

const RecipientsStep = ({ formData, updateFormData }: RecipientsStepProps) => {
  const [newRecipient, setNewRecipient] = useState({
    email: '',
    name: '',
    role: 'teacher'
  });

  const addRecipient = () => {
    if (newRecipient.email && newRecipient.name) {
      const updatedRecipients = [...formData.recipients, { ...newRecipient }];
      updateFormData({ recipients: updatedRecipients });
      setNewRecipient({ email: '', name: '', role: 'teacher' });
    }
  };

  const removeRecipient = (index: number) => {
    const updatedRecipients = formData.recipients.filter((_, i) => i !== index);
    updateFormData({ recipients: updatedRecipients });
  };

  const addPresetRecipients = (role: string) => {
    const presetEmails = {
      principals: [
        { email: 'principal@lincoln.edu', name: 'Dr. Sarah Johnson', role: 'principal' },
        { email: 'principal@washington.edu', name: 'Mr. Michael Brown', role: 'principal' }
      ],
      administrators: [
        { email: 'admin@district.edu', name: 'Ms. Jennifer Wilson', role: 'administrator' },
        { email: 'superintendent@district.edu', name: 'Dr. Robert Davis', role: 'administrator' }
      ],
      teachers: [
        { email: 'teacher1@school.edu', name: 'Ms. Emily Rodriguez', role: 'teacher' },
        { email: 'teacher2@school.edu', name: 'Mr. David Thompson', role: 'teacher' }
      ]
    };

    const existingEmails = formData.recipients.map(r => r.email);
    const newRecipients = presetEmails[role as keyof typeof presetEmails]?.filter(
      recipient => !existingEmails.includes(recipient.email)
    ) || [];

    if (newRecipients.length > 0) {
      updateFormData({ recipients: [...formData.recipients, ...newRecipients] });
    }
  };

  const deliveryMethods = [
    { value: 'email', label: 'Email' },
    { value: 'dashboard', label: 'Dashboard Notification' },
    { value: 'both', label: 'Email + Dashboard' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
          <Mail className="w-5 h-5" />
          <span>Recipients & Delivery</span>
        </h3>
        <p className="text-gray-600 mb-6">
          Configure who will receive the scheduled reports and how they'll be delivered.
        </p>
      </div>

      {/* Delivery Method */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deliveryMethods.map((method) => (
              <Card
                key={method.value}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  formData.deliveryMethod === method.value
                    ? 'ring-2 ring-brand bg-brand/10'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => updateFormData({ deliveryMethod: method.value })}
              >
                <CardContent className="p-4 text-center">
                  <div className="font-medium">{method.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Add Recipients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Quick Add Recipients</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addPresetRecipients('principals')}
            >
              + School Principals
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addPresetRecipients('administrators')}
            >
              + District Administrators
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addPresetRecipients('teachers')}
            >
              + Teachers
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Individual Recipient */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Individual Recipient</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="recipientEmail">Email Address</Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder="recipient@school.edu"
                value={newRecipient.email}
                onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="recipientName">Name</Label>
              <Input
                id="recipientName"
                placeholder="John Doe"
                value={newRecipient.name}
                onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="recipientRole">Role</Label>
              <div className="flex space-x-2">
                <Select
                  value={newRecipient.role}
                  onValueChange={(value) => setNewRecipient({ ...newRecipient, role: value })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="principal">Principal</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addRecipient} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipients List */}
      {formData.recipients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Recipients ({formData.recipients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.recipients.map((recipient, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-medium text-sm">{recipient.name}</div>
                      <div className="text-xs text-gray-600">{recipient.email}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {recipient.role}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRecipient(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Message */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom Message (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="customMessage">Email Message</Label>
            <Textarea
              id="customMessage"
              placeholder="Add a custom message that will be included with each scheduled report..."
              value={formData.customMessage}
              onChange={(e) => updateFormData({ customMessage: e.target.value })}
              rows={4}
            />
            <p className="text-sm text-gray-600">
              This message will be included at the beginning of each automated report email.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecipientsStep;
