
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Student } from '@/types/database';
import { StudentService } from '@/services/studentService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import StudentInfoHeader from '@/components/students/StudentInfoHeader';
import StudentScreeningHistory from '@/components/students/StudentScreeningHistory';
import IndividualReports from '@/components/students/IndividualReports';
import SpeechScreeningModal from '@/components/screening/speech/SpeechScreeningModal';
import HearingScreeningModal from '@/components/screening/hearing/HearingScreeningModal';

const StudentDetail = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSpeechModal, setShowSpeechModal] = useState(false);
  const [showHearingModal, setShowHearingModal] = useState(false);

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

  if (loading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  if (error) return <ErrorMessage message={error} />;
  if (!student) return <div className="p-8 text-center">Student not found</div>;

  // Ensure student has required grade field for the screening forms
  const studentWithGrade: Student & { grade: string } = {
    ...student,
    grade: student.grade || 'N/A'
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <StudentInfoHeader student={student} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudentScreeningHistory 
          studentId={studentId} 
          student={student}
          onAddHearingScreening={() => setShowHearingModal(true)}
        />
        <IndividualReports student={student} isLoading={loading} />
      </div>

      <SpeechScreeningModal 
        isOpen={showSpeechModal}
        onClose={() => setShowSpeechModal(false)}
        onSubmit={handleSpeechScreeningSubmit}
        existingStudent={studentWithGrade as Student}
      />
      
      <HearingScreeningModal 
        isOpen={showHearingModal}
        onClose={() => setShowHearingModal(false)}
        onSubmit={handleHearingScreeningSubmit}
        existingStudent={studentWithGrade as Student}
      />
    </div>
  );
};

export default StudentDetail;
