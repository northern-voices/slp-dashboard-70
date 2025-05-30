import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Database, Shield, Bell, FileText, Activity, Server, Key } from 'lucide-react';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';
import AdminSystemSettings from '@/components/admin/AdminSystemSettings';
import AdminSecuritySettings from '@/components/admin/AdminSecuritySettings';

const AdminPanelContent = () => {
  const { userProfile } = useOrganization();
  
  const userRole = userProfile?.role || 'admin';
  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Dr. Sarah Johnson';

  // Only allow admin access
  if (userRole !== 'admin') {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-25">
          <AppSidebar userRole={userRole} userName={userName} />
          
          <SidebarInset className="flex-1">
            <Header userRole={userRole} userName={userName} />
            
            <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Admin Access Required</h1>
                <p className="text-gray-600">You need administrator privileges to access this panel.</p>
                <Button className="mt-4" onClick={() => window.history.back()}>
                  Go Back
                </Button>
              </div>
            </main>
          </SidebarInset>
          
          <BottomNavigation />
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-25">
        <AppSidebar userRole={userRole} userName={userName} />
        
        <SidebarInset className="flex-1">
          <Header userRole={userRole} userName={userName} />
          
          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
            <div className="mb-6 md:mb-8">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">Admin Panel</h1>
              <p className="text-gray-600 text-sm md:text-base">System administration and configuration</p>
            </div>

            <Tabs defaultValue="system" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="system" className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  System
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="database" className="flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  Database
                </TabsTrigger>
              </TabsList>

              <TabsContent value="system" className="space-y-6">
                <AdminSystemSettings />
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <AdminSecuritySettings />
              </TabsContent>

              <TabsContent value="database" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Database className="w-5 h-5 mr-2" />
                        Database Status
                      </CardTitle>
                      <CardDescription>Monitor database health and performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className="text-green-600 font-medium">Online</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Connections:</span>
                          <span>24/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Storage Used:</span>
                          <span>2.3 GB / 10 GB</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Server className="w-5 h-5 mr-2" />
                        Backup Management
                      </CardTitle>
                      <CardDescription>Manage database backups and restoration</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Last Backup:</span>
                          <span>2 hours ago</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Backup Size:</span>
                          <span>1.8 GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Retention:</span>
                          <span>30 days</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button className="flex-1" variant="outline">
                          Create Backup
                        </Button>
                        <Button className="flex-1" variant="outline">
                          Restore
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
        
        <BottomNavigation />
      </div>
    </SidebarProvider>
  );
};

const AdminPanel = () => {
  return (
    <OrganizationProvider>
      <AdminPanelContent />
    </OrganizationProvider>
  );
};

export default AdminPanel;
