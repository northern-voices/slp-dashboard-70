
import React from 'react';
import { Volume2, FileText } from 'lucide-react';
import ClassWideHearingForm from '@/components/reports/ClassWideHearingForm';
import ClassWideSpeechForm from '@/components/reports/ClassWideSpeechForm';

const ReportsPageContent = () => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900">Reports</h1>
        <p className="text-gray-600">Generate class-wide reports for hearing and speech assessments</p>
      </div>

      {/* Hearing Reports Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Volume2 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Hearing Reports</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ClassWideHearingForm />
        </div>
      </div>

      {/* Speech Reports Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Speech Reports</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <ClassWideSpeechForm 
            title="Class Wide Speech Screens" 
            reportType="screens" 
          />
          <ClassWideSpeechForm 
            title="Class Wide Goal Sheets" 
            reportType="goals" 
          />
          <ClassWideSpeechForm 
            title="Class Wide Progress Reports" 
            reportType="progress" 
          />
        </div>
      </div>
    </div>
  );
};

export default ReportsPageContent;
