import React, { useState } from 'react';
import { Mail, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import ClassWideReportsModal from '@/components/students/ClassWideReportsModal';
import GeneratedReportsList from '@/components/reports/GeneratedReportsList';
const ReportsPageContent = () => {
  const [showClassWideModal, setShowClassWideModal] = useState(false);
  const navigate = useNavigate();
  return <div className="min-h-screen w-full overflow-hidden">
      <div className="space-y-6 sm:space-y-8 pb-8">
        {/* Page Header */}
        <div className="flex flex-col gap-6 px-1 sm:px-0">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">Reports</h1>
            <p className="text-sm sm:text-base text-gray-600">Generate class-wide reports for hearing and speech assessments</p>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Send Class-Wide Reports Button */}
            

            {/* Generate Class-Wide Report Button */}
            <Card className="bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/reports/generate')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Generate Class-Wide Report</h3>
                    <p className="text-sm text-gray-600">Create comprehensive reports for hearing and speech assessments across multiple students</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Generated Reports Section */}
        <div className="w-full max-w-full">
          <GeneratedReportsList />
        </div>
      </div>

      <ClassWideReportsModal isOpen={showClassWideModal} onClose={() => setShowClassWideModal(false)} />
    </div>;
};
export default ReportsPageContent;