
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';

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
    </div>
  );
};

export default ReportsPageContent;
