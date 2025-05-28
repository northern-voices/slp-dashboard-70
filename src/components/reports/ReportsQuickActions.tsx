
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const ReportsQuickActions = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-900">Generate Summary Report</CardTitle>
          <CardDescription>Create comprehensive reports for multiple students</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full h-11">Generate Report</Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-900">Export Data</CardTitle>
          <CardDescription>Download screening data in various formats</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full h-11">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsQuickActions;
