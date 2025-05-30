import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Student } from '@/types/database';
import { StudentService } from '@/services/studentService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import StudentInfoHeader from '@/components/student/StudentInfoHeader';
import StudentScreeningHistory from '@/components/student/StudentScreeningHistory';
import IndividualReports from '@/components/student/IndividualReports';
import SpeechScreeningModal from '@/components/modals/SpeechScreeningModal';
import HearingScreeningModal from '@/components/modals/HearingScreeningModal';

const StudentDetail = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  if (error) return <ErrorMessage message={error} />;
  if (!student) return <div className="p-8 text-center">Student not found</div>;

  // Ensure student has required grade field for the screening forms
  const studentWithGrade = {
    ...student,
    grade: student.grade || 'N/A'
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <StudentInfoHeader student={student} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudentScreeningHistory studentId={studentId} />
        <IndividualReports studentId={studentId} />
      </div>

      <SpeechScreeningModal 
        existingStudent={studentWithGrade}
      />
      
      <HearingScreeningModal 
        existingStudent={studentWithGrade}
      />
    </div>
  );
};

export default StudentDetail;
