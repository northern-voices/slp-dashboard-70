
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Lock, Shield, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AccountSettingsSection = () => {
  const { toast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const passwordForm = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onPasswordSubmit = (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    console.log('Updating password:', data);
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully."
    });
    setShowPasswordForm(false);
    passwordForm.reset();
  };

  const handleTwoFactorToggle = (enabled: boolean) => {
    setTwoFactorEnabled(enabled);
    toast({
      title: enabled ? "2FA Enabled" : "2FA Disabled",
      description: enabled 
        ? "Two-factor authentication has been enabled for your account."
        : "Two-factor authentication has been disabled for your account."
    });
  };

  const handleLogoutAllDevices = () => {
    toast({
      title: "Sessions Ended",
      description: "You have been logged out from all other devices."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Account Security
        </CardTitle>
        <CardDescription>
          Manage your password, two-factor authentication, and active sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Password Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Password</Label>
              <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              Change Password
            </Button>
          </div>

          {showPasswordForm && (
            <Card className="bg-muted/20">
              <CardContent className="pt-6">
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button type="submit">Update Password</Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowPasswordForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Two-Factor Authentication */}
        <div className="flex items-center justify-between py-4 border-t">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-brand" />
            <div>
              <Label className="text-base font-medium">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={handleTwoFactorToggle}
          />
        </div>

        {/* Active Sessions */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Active Sessions</Label>
              <p className="text-sm text-muted-foreground">
                You are currently logged in on 3 devices
              </p>
            </div>
            <Button variant="outline" onClick={handleLogoutAllDevices}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout All Devices
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
              <div>
                <p className="font-medium text-sm">Current Session</p>
                <p className="text-xs text-muted-foreground">Chrome on Windows • Active now</p>
              </div>
              <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full">Current</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
              <div>
                <p className="font-medium text-sm">Mobile Device</p>
                <p className="text-xs text-muted-foreground">Safari on iPhone • 2 hours ago</p>
              </div>
              <Button variant="ghost" size="sm">Logout</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSettingsSection;
