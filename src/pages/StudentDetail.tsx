import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Student } from '@/types/database';
import { StudentService } from '@/services/studentService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import StudentInfoHeader from '@/components/students/StudentInfoHeader';
import StudentScreeningHistory from '@/components/students/StudentScreeningHistory';
import StudentDetailPagination from '@/components/students/StudentDetailPagination';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';

const StudentDetailContent = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [currentStudentIndex, setCurrentStudentIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useOrganization();
  const { toast } = useToast();

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

  const handleNavigateBack = () => {
    navigate('/students');
  };

  const handleAddHearingScreening = () => {
    navigate(`/screening/hearing/${studentId}`);
  };

  const handleAddSpeechScreening = () => {
    navigate(`/screening/speech/${studentId}`);
  };

  const handleDeleteStudent = async () => {
    if (!student) return;
    
    try {
      await StudentService.deleteStudent(student.id);
      toast({
        title: "Student deleted",
        description: "The student has been successfully deleted.",
        variant: "destructive",
      });
      navigate('/students');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMoveUpGrade = async () => {
    if (!student) return;
    
    const gradeMap: { [key: string]: string } = {
      'Pre-K': 'K',
      'K': '1st',
      '1st': '2nd',
      '2nd': '3rd',
      '3rd': '4th',
      '4th': '5th',
      '5th': '6th',
      '6th': '7th',
      '7th': '8th',
      '8th': '9th',
      '9th': '10th',
      '10th': '11th',
      '11th': '12th',
    };
    
    const nextGrade = gradeMap[student.grade || ''];
    if (!nextGrade) return;
    
    try {
      const updatedStudent = await StudentService.updateStudent(student.id, {
        grade: nextGrade
      });
      setStudent(updatedStudent);
      toast({
        title: "Grade updated",
        description: `${student.first_name} has been moved to ${nextGrade}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student grade. Please try again.",
        variant: "destructive",
      });
    }
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
          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-8">
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
              <StudentInfoHeader 
                student={student} 
                isLoading={loading}
                onDelete={handleDeleteStudent}
                onMoveUpGrade={handleMoveUpGrade}
              />
              
              <StudentScreeningHistory 
                studentId={studentId} 
                student={student}
                onAddHearingScreening={handleAddHearingScreening}
                onAddSpeechScreening={handleAddSpeechScreening}
              />
            </div>
          </main>
        </SidebarInset>
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
