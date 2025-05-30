import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Mail, Phone, User } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import ScreeningForm from '../screening/ScreeningForm';
import { ScreeningFormData } from '@/types/screening';
import { useToast } from '@/hooks/use-toast';

type Student = Database['public']['Tables']['students']['Row'];

// Mock data - in real app this would come from an API
const mockStudent: Student = {
  id: '1',
  school_id: 'school1',
  student_id: 'STU001',
  first_name: 'Emma',
  last_name: 'Johnson',
  date_of_birth: '2015-03-15',
  grade: 'K',
  gender: 'female',
  emergency_contact_name: 'Sarah Johnson',
  emergency_contact_phone: '(555) 123-4567',
  notes: 'Excellent progress in phonemic awareness',
  active: true,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

interface StudentInfoHeaderProps {
  studentId?: string;
}

const StudentInfoHeader = ({ studentId }: StudentInfoHeaderProps) => {
  const student = mockStudent; // In real app, fetch by studentId
  const [showScreeningForm, setShowScreeningForm] = useState(false);
  const { toast } = useToast();

  const handleScreeningSubmit = (screeningData: ScreeningFormData) => {
    console.log('Screening submitted for student:', screeningData);
    
    toast({
      title: "Screening completed",
      description: "Screening has been recorded successfully.",
    });

    setShowScreeningForm(false);
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <>
      <div className="space-y-6">
        {/* Student Basic Info */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {student.first_name} {student.last_name}
                </h2>
                <p className="text-blue-600 font-medium">Student ID: {student.student_id}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={student.active ? "default" : "secondary"}>
                    {student.active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">Grade {student.grade}</Badge>
                </div>
              </div>
            </div>

            {/* Student Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Age: {calculateAge(student.date_of_birth)} years old</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4 text-blue-600" />
                <span>Gender: {student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Emergency: {student.emergency_contact_phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4 text-blue-600" />
                <span>Contact: {student.emergency_contact_name}</span>
              </div>
            </div>

            {/* Notes */}
            {student.notes && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong className="text-blue-700">Notes:</strong> {student.notes}
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-2 lg:min-w-[200px]">
            <Button 
              onClick={() => setShowScreeningForm(true)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Screening
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Goal Sheet
            </Button>
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Send to Parent/Guardian
            </Button>
          </div>
        </div>
      </div>

      {/* Screening Form */}
      <ScreeningForm
        isOpen={showScreeningForm}
        onClose={() => setShowScreeningForm(false)}
        onSubmit={handleScreeningSubmit}
        existingStudent={student}
        title={`New Screening - ${student.first_name} ${student.last_name}`}
      />
    </>
  );
};

export default StudentInfoHeader;
