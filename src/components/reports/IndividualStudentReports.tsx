
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Volume2, CheckCircle, Target, Mail, User } from 'lucide-react';
import { Student } from '@/types/database';
import { StudentService } from '@/services/studentService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import IndividualReportEmailModal from './IndividualReportEmailModal';

const IndividualStudentReports = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsData = await StudentService.getStudents();
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleGenerateReport = (reportType: string) => {
    if (!selectedStudent) {
      console.log('Cannot generate report: No student selected');
      return;
    }
    console.log(`Generating ${reportType} for student:`, selectedStudent.id);
    // TODO: Implement individual report generation
  };

  const handleStudentSelect = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setSelectedStudent(student || null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <LoadingSpinner size="sm" className="mr-2" />
        <span className="text-sm text-gray-600">Loading students...</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Student Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Select Student</label>
          <Select onValueChange={handleStudentSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a student..." />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{student.first_name} {student.last_name}</span>
                    <span className="text-sm text-gray-500 ml-2">Grade {student.grade}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Student Info */}
        {selectedStudent && (
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-900">
                {selectedStudent.first_name} {selectedStudent.last_name}
              </span>
              <span className="text-sm text-purple-700">
                Grade {selectedStudent.grade}
              </span>
            </div>
          </div>
        )}

        {/* Report Options */}
        <div className="space-y-3">
          {/* Student Individual Tools */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Student Tools</h4>
            <div className="grid grid-cols-1 gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => selectedStudent && navigate(`/students/${selectedStudent.id}/progress-check`)} 
                    variant="outline" 
                    size="sm"
                    className="w-full justify-start h-9 text-sm" 
                    disabled={!selectedStudent}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Monthly Progress Check
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Track and document student's monthly therapy progress</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => selectedStudent && navigate(`/students/${selectedStudent.id}/goal-sheet`)} 
                    variant="outline" 
                    size="sm"
                    className="w-full justify-start h-9 text-sm" 
                    disabled={!selectedStudent}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Generate Goal Sheet
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create individualized therapy goals and objectives</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Speech Reports */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Speech Reports</h4>
            <div className="grid grid-cols-1 gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => handleGenerateReport('speech-screen')} 
                    variant="outline" 
                    size="sm"
                    className="w-full justify-start h-9 text-sm" 
                    disabled={!selectedStudent}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Speech Screen Report
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate a comprehensive speech screening assessment report</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => handleGenerateReport('progress-report')} 
                    variant="outline" 
                    size="sm"
                    className="w-full justify-start h-9 text-sm" 
                    disabled={!selectedStudent}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Progress Report
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create a detailed progress summary for speech therapy services</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Hearing Reports */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Hearing Reports</h4>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => handleGenerateReport('hearing-screen')} 
                  variant="outline" 
                  size="sm"
                  className="w-full justify-start h-9 text-sm" 
                  disabled={!selectedStudent}
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Hearing Screen Report
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate a complete hearing screening assessment document</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Send Reports */}
          <div className="pt-2 border-t border-gray-200">
            <Button 
              onClick={() => setShowEmailModal(true)}
              variant="default" 
              size="sm"
              className="w-full h-9 bg-purple-600 hover:bg-purple-700 text-white" 
              disabled={!selectedStudent}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Reports via Email
            </Button>
          </div>
        </div>
      </div>

      {selectedStudent && (
        <IndividualReportEmailModal 
          isOpen={showEmailModal} 
          onClose={() => setShowEmailModal(false)} 
          student={selectedStudent} 
        />
      )}
    </>
  );
};

export default IndividualStudentReports;
