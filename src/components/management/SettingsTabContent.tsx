
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SettingsTabContentProps {
  onOpenOrganizationSettings: () => void;
  onOpenScreeningTemplates: () => void;
  onOpenNotificationSettings: () => void;
}

const SettingsTabContent = ({
  onOpenOrganizationSettings,
  onOpenScreeningTemplates,
  onOpenNotificationSettings
}: SettingsTabContentProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">System Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Organization Settings</CardTitle>
            <CardDescription>Manage organization-wide preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onOpenOrganizationSettings}
            >
              Configure
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Screening Templates</CardTitle>
            <CardDescription>Customize screening forms and assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onOpenScreeningTemplates}
            >
              Manage Templates
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure system notifications and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onOpenNotificationSettings}
            >
              Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Export</CardTitle>
            <CardDescription>Export and backup system data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Export Data</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsTabContent;
