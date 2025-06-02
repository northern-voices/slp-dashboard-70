
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SchoolSupport = () => {
  const navigate = useNavigate();

  const handleCreateSupportForm = () => {
    // For now, we'll navigate to the students page
    // In a real implementation, this might open a student selector modal
    navigate('/students');
  };

  return (
    <OrganizationProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <Header />
            <div className="flex-1 bg-gray-25 p-4 md:p-6 lg:p-8">
              <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                  <h1 className="text-3xl font-semibold text-gray-900 mb-2">School Support</h1>
                  <p className="text-gray-600">Manage school support forms and coordination activities</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Support Forms</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                      <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Schools Supported</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">8</div>
                      <p className="text-xs text-muted-foreground">Across district</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Upcoming Visits</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">5</div>
                      <p className="text-xs text-muted-foreground">This week</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Support Forms</h2>
                  <Button onClick={handleCreateSupportForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Support Form
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No support forms yet</h3>
                      <p className="text-gray-600 mb-4">Create your first school support form to get started</p>
                      <Button onClick={handleCreateSupportForm}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Support Form
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </OrganizationProvider>
  );
};

export default SchoolSupport;
