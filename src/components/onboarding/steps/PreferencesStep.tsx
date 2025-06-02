
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PreferencesStepProps {
  formData: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    reportReminders: boolean;
    weeklyDigest: boolean;
    timezone: string;
    language: string;
  };
  setFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const PreferencesStep = ({ formData, setFormData, onNext, onBack }: PreferencesStepProps) => {
  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Preferences & Settings</h3>
        <p className="text-gray-600">
          Customize your notification preferences and account settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="font-normal">Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive updates and alerts via email</p>
            </div>
            <Switch
              id="email-notifications"
              checked={formData.emailNotifications}
              onCheckedChange={(checked) => updateField('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms-notifications" className="font-normal">SMS Notifications</Label>
              <p className="text-sm text-gray-500">Receive urgent alerts via text message</p>
            </div>
            <Switch
              id="sms-notifications"
              checked={formData.smsNotifications}
              onCheckedChange={(checked) => updateField('smsNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="report-reminders" className="font-normal">Report Reminders</Label>
              <p className="text-sm text-gray-500">Get reminded about pending reports</p>
            </div>
            <Switch
              id="report-reminders"
              checked={formData.reportReminders}
              onCheckedChange={(checked) => updateField('reportReminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weekly-digest" className="font-normal">Weekly Digest</Label>
              <p className="text-sm text-gray-500">Receive weekly summary emails</p>
            </div>
            <Switch
              id="weekly-digest"
              checked={formData.weeklyDigest}
              onCheckedChange={(checked) => updateField('weeklyDigest', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Timezone</Label>
          <Select 
            value={formData.timezone} 
            onValueChange={(value) => updateField('timezone', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PST">Pacific Time (PST)</SelectItem>
              <SelectItem value="MST">Mountain Time (MST)</SelectItem>
              <SelectItem value="CST">Central Time (CST)</SelectItem>
              <SelectItem value="EST">Eastern Time (EST)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Language</Label>
          <Select 
            value={formData.language} 
            onValueChange={(value) => updateField('language', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} className="px-8">
          Next: Welcome
        </Button>
      </div>
    </div>
  );
};

export default PreferencesStep;
