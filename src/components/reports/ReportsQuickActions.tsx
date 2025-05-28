
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Download } from 'lucide-react';

interface ReportsQuickActionsProps {
  onScheduleClick: () => void;
}

const ReportsQuickActions = ({ onScheduleClick }: ReportsQuickActionsProps) => {
  return (
    <div className="space-y-4 mb-8">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Generate Summary Report</CardTitle>
          <CardDescription>Create comprehensive reports for multiple students</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full h-11">Generate Report</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Export Data</CardTitle>
            <CardDescription>Download screening data in various formats</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full h-11">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Schedule Reports</CardTitle>
            <CardDescription>Set up automated report generation</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full h-11"
              onClick={onScheduleClick}
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsQuickActions;
