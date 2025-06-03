
import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UnifiedReportForm from '@/components/reports/UnifiedReportForm';
import ClassWideReportsModal from '@/components/students/ClassWideReportsModal';

const ReportsPageContent = () => {
  const [showClassWideModal, setShowClassWideModal] = useState(false);

  return (
    <>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900">Reports</h1>
            <p className="text-gray-600">Generate class-wide reports for hearing and speech assessments</p>
          </div>
          
          <Button onClick={() => setShowClassWideModal(true)} className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Send Class-Wide Reports
          </Button>
        </div>

        {/* Full Width Unified Report Form */}
        <UnifiedReportForm />
      </div>

      <ClassWideReportsModal 
        isOpen={showClassWideModal} 
        onClose={() => setShowClassWideModal(false)} 
      />
    </>
  );
};

export default ReportsPageContent;
