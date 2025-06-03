
import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import UnifiedReportForm from '@/components/reports/UnifiedReportForm';
import ClassWideReportsModal from '@/components/students/ClassWideReportsModal';

const ReportsPageContent = () => {
  const [showClassWideModal, setShowClassWideModal] = useState(false);

  return (
    <div className="min-h-screen w-full overflow-hidden">
      <div className="space-y-6 sm:space-y-8 pb-8">
        {/* Page Header */}
        <div className="flex flex-col gap-6 px-1 sm:px-0">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">Reports</h1>
            <p className="text-sm sm:text-base text-gray-600">Generate class-wide reports for hearing and speech assessments</p>
          </div>
          
          {/* Dashboard-style Button Box */}
          <Card 
            className="bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setShowClassWideModal(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Send Class-Wide Reports</h3>
                  <p className="text-sm text-gray-600">Email comprehensive reports to teachers, administrators, and parents for multiple students at once</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
