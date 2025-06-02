
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Student } from '@/types/database';
import { StudentService } from '@/services/studentService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import StudentInfoHeader from '@/components/students/StudentInfoHeader';
import StudentScreeningHistory from '@/components/students/StudentScreeningHistory';
import IndividualReports from '@/components/students/IndividualReports';
import StudentDetailPagination from '@/components/students/StudentDetailPagination';
import SpeechScreeningModal from '@/components/screening/speech/SpeechScreeningModal';
import HearingScreeningModal from '@/components/screening/hearing/HearingScreeningModal';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

const StudentDetailContent = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSpeechModal, setShowSpeechModal] = useState(false);
  const [showHearingModal, setShowHearingModal] = useState(false);
  const { userProfile } = useOrganization();

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!studentId) {
          setError('Student ID is required.');
          return;
        }
        const fetchedStudent = await StudentService.getStudentById(studentId);
        if (fetchedStudent) {
          setStudent(fetchedStudent);
        } else {
          setError('Student not found.');
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load student.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  const handleSpeechScreeningSubmit = (data: any) => {
    console.log('Speech screening submitted:', data);
    setShowSpeechModal(false);
  };

  const handleHearingScreeningSubmit = (data: any) => {
    console.log('Hearing screening submitted:', data);
    setShowHearingModal(false);
  };

  const handleNavigateBack = () => {
    navigate('/students');
  };

  if (loading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  if (error) return <ErrorMessage message={error} />;
  if (!student) return <div className="p-8 text-center">Student not found</div>;

  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Dr. Sarah Johnson';
  const userRole = userProfile?.role || 'slp';

  return (
    <div className="min-h-screen flex w-full bg-gray-25">
      <SidebarProvider>
        <AppSidebar 
          userRole={userRole as 'admin' | 'slp' | 'supervisor'} 
          userName={userName}
        />
        <SidebarInset>
          <Header 
            userRole={userRole as 'admin' | 'slp' | 'supervisor'} 
            userName={userName}
          />
          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
            <StudentDetailPagination
              currentStudent={`${student.first_name} ${student.last_name}`}
              onNavigateBack={handleNavigateBack}
              hasPrevious={false}
              hasNext={false}
            />
            
            <div className="space-y-6">
              <StudentInfoHeader student={student} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <StudentScreeningHistory 
                    studentId={studentId} 
                    student={student}
                    onAddHearingScreening={() => setShowHearingModal(true)}
                  />
                </div>
                
                <div className="space-y-6">
                  <IndividualReports student={student} isLoading={loading} />
                </div>
              </div>

              <SpeechScreeningModal 
                isOpen={showSpeechModal}
                onClose={() => setShowSpeechModal(false)}
                onSubmit={handleSpeechScreeningSubmit}
                existingStudent={student}
              />
              
              <HearingScreeningModal 
                isOpen={showHearingModal}
                onClose={() => setShowHearingModal(false)}
                onSubmit={handleHearingScreeningSubmit}
                existingStudent={student}
              />
            </div>
          </main>
        </SidebarInset>
        <BottomNavigation />
      </SidebarProvider>
    </div>
  );
};

const StudentDetail = () => {
  return (
    <OrganizationProvider>
      <StudentDetailContent />
    </OrganizationProvider>
  );
};

export default StudentDetail;
