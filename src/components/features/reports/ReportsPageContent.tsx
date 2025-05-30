
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Calendar, Filter } from 'lucide-react';

const ReportsPageContent = () => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate and manage student reports</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter Reports
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <FileText className="w-6 h-6" />
              <span>Generate Student Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <Calendar className="w-6 h-6" />
              <span>Schedule Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <FileText className="w-6 h-6" />
              <span>View All Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No reports available. Generate your first report to get started.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPageContent;
