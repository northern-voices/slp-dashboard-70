
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
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [currentStudentIndex, setCurrentStudentIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSpeechModal, setShowSpeechModal] = useState(false);
  const [showHearingModal, setShowHearingModal] = useState(false);
  const { userProfile } = useOrganization();

  useEffect(() => {
    const fetchStudentsAndCurrent = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all students first
        const students = await StudentService.getStudents();
        setAllStudents(students);

        if (!studentId) {
          setError('Student ID is required.');
          return;
        }

        // Find current student in the list
        const currentIndex = students.findIndex(s => s.id === studentId);
        if (currentIndex === -1) {
          setError('Student not found.');
          return;
        }

        setCurrentStudentIndex(currentIndex);
        setStudent(students[currentIndex]);
      } catch (e: any) {
        setError(e.message || 'Failed to load student.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndCurrent();
  }, [studentId]);

  const handleNavigatePrevious = () => {
    if (currentStudentIndex > 0) {
      const previousStudent = allStudents[currentStudentIndex - 1];
      navigate(`/students/${previousStudent.id}`);
    }
  };

  const handleNavigateNext = () => {
    if (currentStudentIndex < allStudents.length - 1) {
      const nextStudent = allStudents[currentStudentIndex + 1];
      navigate(`/students/${nextStudent.id}`);
    }
  };

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

  const hasPrevious = currentStudentIndex > 0;
  const hasNext = currentStudentIndex < allStudents.length - 1;

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
              currentIndex={currentStudentIndex}
              totalStudents={allStudents.length}
              onNavigateBack={handleNavigateBack}
              onNavigatePrevious={handleNavigatePrevious}
              onNavigateNext={handleNavigateNext}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
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
