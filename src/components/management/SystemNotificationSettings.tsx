
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, AlertTriangle, Save, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SystemNotificationSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    enableSystemNotifications: true,
    enableEmergencyAlerts: true,
    maintenanceNotifications: true,
    defaultEmailFrequency: 'daily',
    emergencyContactEmail: 'admin@district.edu',
    maintenanceWindowStart: '02:00',
    maintenanceWindowEnd: '04:00'
  });

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving system notification settings:', settings);
    toast({
      title: "Settings Saved",
      description: "System notification settings have been updated successfully."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Global Notification Settings
          </CardTitle>
          <CardDescription>
            Configure system-wide notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Enable System Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Allow the system to send notifications to users
              </p>
            </div>
            <Switch
              checked={settings.enableSystemNotifications}
              onCheckedChange={(checked) => handleSettingChange('enableSystemNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Maintenance Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Notify users about scheduled maintenance
              </p>
            </div>
            <Switch
              checked={settings.maintenanceNotifications}
              onCheckedChange={(checked) => handleSettingChange('maintenanceNotifications', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Default Email Frequency for New Users</Label>
            <Select 
              value={settings.defaultEmailFrequency} 
              onValueChange={(value) => handleSettingChange('defaultEmailFrequency', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Emergency Alert Settings
          </CardTitle>
          <CardDescription>
            Configure emergency notification system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Enable Emergency Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Allow sending critical emergency notifications
              </p>
            </div>
            <Switch
              checked={settings.enableEmergencyAlerts}
              onCheckedChange={(checked) => handleSettingChange('enableEmergencyAlerts', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Emergency Contact Email</Label>
            <Input
              value={settings.emergencyContactEmail}
              onChange={(e) => handleSettingChange('emergencyContactEmail', e.target.value)}
              placeholder="admin@district.edu"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Maintenance Window Start</Label>
              <Input
                type="time"
                value={settings.maintenanceWindowStart}
                onChange={(e) => handleSettingChange('maintenanceWindowStart', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Maintenance Window End</Label>
              <Input
                type="time"
                value={settings.maintenanceWindowEnd}
                onChange={(e) => handleSettingChange('maintenanceWindowEnd', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default SystemNotificationSettings;
