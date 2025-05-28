
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NotificationPreferencesSection = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    systemAlerts: true,
    reportNotifications: true,
    studentUpdates: false,
    securityAlerts: true,
    marketingEmails: false,
    frequency: 'daily',
    reportFrequency: 'weekly'
  });

  const handlePreferenceChange = (key: string, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving notification preferences:', preferences);
    toast({
      title: "Preferences Saved",
      description: "Your notification preferences have been updated successfully."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Configure how and when you receive notifications from the system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Email Notifications
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">System Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Important system updates and maintenance alerts
                </p>
              </div>
              <Switch
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Security Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Login attempts and security-related notifications
                </p>
              </div>
              <Switch
                checked={preferences.securityAlerts}
                onCheckedChange={(checked) => handlePreferenceChange('securityAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Report Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Automated reports and data summaries
                </p>
              </div>
              <Switch
                checked={preferences.reportNotifications}
                onCheckedChange={(checked) => handlePreferenceChange('reportNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Student Updates</Label>
                <p className="text-sm text-muted-foreground">
                  New student registrations and profile changes
                </p>
              </div>
              <Switch
                checked={preferences.studentUpdates}
                onCheckedChange={(checked) => handlePreferenceChange('studentUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Marketing Communications</Label>
                <p className="text-sm text-muted-foreground">
                  Product updates and promotional content
                </p>
              </div>
              <Switch
                checked={preferences.marketingEmails}
                onCheckedChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
              />
            </div>
          </div>
        </div>

        {/* Frequency Settings */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold">Frequency Settings</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>General Notification Frequency</Label>
              <Select 
                value={preferences.frequency} 
                onValueChange={(value) => handlePreferenceChange('frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Report Delivery Frequency</Label>
              <Select 
                value={preferences.reportFrequency} 
                onValueChange={(value) => handlePreferenceChange('reportFrequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold">In-App Notifications</h4>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">System Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Show popup notifications within the application
              </p>
            </div>
            <Switch
              checked={preferences.systemAlerts}
              onCheckedChange={(checked) => handlePreferenceChange('systemAlerts', checked)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferencesSection;
