
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, Key, Save, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminSecuritySettings = () => {
  const { toast } = useToast();
  const [securitySettings, setSecuritySettings] = useState({
    requireMFA: false,
    passwordMinLength: '8',
    passwordExpiry: '90',
    lockoutAttempts: '5',
    lockoutDuration: '30',
    ipWhitelist: '',
    auditLogging: true,
    encryptData: true
  });

  const handleSave = () => {
    toast({
      title: "Security Settings Saved",
      description: "Security configuration has been updated successfully"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Authentication & Access
          </CardTitle>
          <CardDescription>Configure user authentication and access controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Require Multi-Factor Authentication</Label>
              <p className="text-sm text-gray-500">Force all users to enable MFA</p>
            </div>
            <Switch
              checked={securitySettings.requireMFA}
              onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireMFA: checked }))}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
              <Input
                id="passwordMinLength"
                type="number"
                value={securitySettings.passwordMinLength}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
              <Input
                id="passwordExpiry"
                type="number"
                value={securitySettings.passwordExpiry}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordExpiry: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lockoutAttempts">Failed Login Attempts</Label>
              <Input
                id="lockoutAttempts"
                type="number"
                value={securitySettings.lockoutAttempts}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, lockoutAttempts: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
              <Input
                id="lockoutDuration"
                type="number"
                value={securitySettings.lockoutDuration}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, lockoutDuration: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Data Protection
          </CardTitle>
          <CardDescription>Configure data security and encryption settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Audit Logging</Label>
              <p className="text-sm text-gray-500">Log all user actions and system events</p>
            </div>
            <Switch
              checked={securitySettings.auditLogging}
              onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, auditLogging: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Data Encryption</Label>
              <p className="text-sm text-gray-500">Encrypt sensitive data at rest</p>
            </div>
            <Switch
              checked={securitySettings.encryptData}
              onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, encryptData: checked }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ipWhitelist">IP Whitelist</Label>
            <Input
              id="ipWhitelist"
              value={securitySettings.ipWhitelist}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, ipWhitelist: e.target.value }))}
              placeholder="Enter comma-separated IP addresses (optional)"
            />
            <p className="text-xs text-gray-500">Leave empty to allow access from any IP</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-800">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-orange-700">
            <li>• Enable multi-factor authentication for all admin users</li>
            <li>• Use strong passwords with minimum 12 characters</li>
            <li>• Regularly review user access and permissions</li>
            <li>• Monitor audit logs for suspicious activity</li>
            <li>• Keep the system updated with latest security patches</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Security Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminSecuritySettings;
