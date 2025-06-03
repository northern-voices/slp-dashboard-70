
import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UnifiedReportForm from '@/components/reports/UnifiedReportForm';
import ClassWideReportsModal from '@/components/students/ClassWideReportsModal';

const ReportsPageContent = () => {
  const [showClassWideModal, setShowClassWideModal] = useState(false);

  return (
    <div className="min-h-screen w-full overflow-hidden">
      <div className="space-y-6 sm:space-y-8 pb-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1 sm:px-0">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">Reports</h1>
            <p className="text-sm sm:text-base text-gray-600">Generate class-wide reports for hearing and speech assessments</p>
          </div>
          
          <Button 
            onClick={() => setShowClassWideModal(true)} 
            className="flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base"
          >
            <Mail className="w-4 h-4" />
            <span className="sm:inline">Send Class-Wide Reports</span>
          </Button>
        </div>

        {/* Full Width Unified Report Form */}
        <div className="w-full max-w-full">
          <UnifiedReportForm />
        </div>
      </div>

      <ClassWideReportsModal 
        isOpen={showClassWideModal} 
        onClose={() => setShowClassWideModal(false)} 
      />
    </div>
  );
};

export default ReportsPageContent;
