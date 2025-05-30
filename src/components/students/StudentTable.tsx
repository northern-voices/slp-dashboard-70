import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreVertical, Search, Filter, FileText, Edit, Trash2, Eye, UserPlus, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import StudentForm from './StudentForm';
import { Database } from '@/types/supabase';

type Student = Database['public']['Tables']['students']['Row'];

interface StudentTableProps {
  students: Student[];
  onStudentUpdate?: (student: Student) => void;
  onStudentDelete?: (studentId: string) => void;
  onStudentCreate?: (student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({ students, onStudentUpdate, onStudentDelete, onStudentCreate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewReport = (studentId: string) => {
    navigate(`/students/${studentId}`);
    toast({
      title: "Navigating to Student Report",
      description: "View student screenings and records",
    });
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (onStudentDelete) {
      onStudentDelete(studentId);
      toast({
        title: "Student Deleted",
        description: "This student has been removed from the active list.",
      });
    }
  };

  const handleCreateStudent = (newStudent: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    if (onStudentCreate) {
      onStudentCreate(newStudent);
      toast({
        title: "Student Created",
        description: "A new student record has been added.",
      });
    }
    setIsCreateModalOpen(false);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    if (onStudentUpdate) {
      onStudentUpdate(updatedStudent);
      toast({
        title: "Student Updated",
        description: "The student record has been updated successfully.",
      });
    }
    setIsEditModalOpen(false);
  };

  const filteredStudents = students.filter(student => {
    const searchRegex = new RegExp(searchQuery, 'i');
    const matchesSearch = searchRegex.test(student.first_name) ||
                         searchRegex.test(student.last_name) ||
                         searchRegex.test(student.student_id);

    const matchesGrade = gradeFilter === 'all' || student.grade === gradeFilter;

    return matchesSearch && matchesGrade;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const lastNameA = a.last_name.toUpperCase();
    const lastNameB = b.last_name.toUpperCase();
    if (lastNameA < lastNameB) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (lastNameA > lastNameB) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const gradeOptions = [...new Set(students.map(student => student.grade).filter(Boolean))].sort();

  return (
    <>
      <Card className="bg-white border-gray-100 shadow-sm">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">Student Records</CardTitle>
          <CardContent className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search students..."
                className="pl-10 pr-3 py-2 rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-[120px] md:w-[150px] lg:w-[180px] text-sm">
                  <SelectValue placeholder="Filter by Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {gradeOptions.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" variant="outline" onClick={() => setIsCreateModalOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </CardContent>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px] md:w-[200px]">
                  Name
                </TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStudents.map(student => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.first_name} {student.last_name}</TableCell>
                  <TableCell>{student.student_id}</TableCell>
                  <TableCell>{student.grade || 'N/A'}</TableCell>
                  <TableCell>{new Date(student.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewReport(student.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Report
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Student
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteStudent(student.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Student
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {sortedStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      <StudentForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateStudent}
      />

      {selectedStudent && (
        <StudentForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateStudent}
          existingStudent={selectedStudent}
        />
      )}
    </>
  );
};

export default StudentTable;
