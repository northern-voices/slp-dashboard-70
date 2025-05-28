
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminSystemSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    systemName: 'Springfield School District',
    maintenanceMode: false,
    autoBackup: true,
    emailNotifications: true,
    sessionTimeout: '30',
    maxFileSize: '10',
    allowRegistration: false
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully"
    });
  };

  const handleReset = () => {
    setSettings({
      systemName: 'Springfield School District',
      maintenanceMode: false,
      autoBackup: true,
      emailNotifications: true,
      sessionTimeout: '30',
      maxFileSize: '10',
      allowRegistration: false
    });
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            General Settings
          </CardTitle>
          <CardDescription>Configure basic system settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="systemName">System Name</Label>
            <Input
              id="systemName"
              value={settings.systemName}
              onChange={(e) => setSettings(prev => ({ ...prev, systemName: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => setSettings(prev => ({ ...prev, maxFileSize: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Features</CardTitle>
          <CardDescription>Enable or disable system features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-gray-500">Put the system in maintenance mode</p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Backup</Label>
              <p className="text-sm text-gray-500">Automatically backup data daily</p>
            </div>
            <Switch
              checked={settings.autoBackup}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoBackup: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">Send system notifications via email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Registration</Label>
              <p className="text-sm text-gray-500">Allow new users to self-register</p>
            </div>
            <Switch
              checked={settings.allowRegistration}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowRegistration: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminSystemSettings;
