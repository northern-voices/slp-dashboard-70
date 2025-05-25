import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, FileDown, Eye, Edit, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Student } from '@/types/database';
import StudentFilters from './StudentFilters';
import StudentForm from './StudentForm';
import { useToast } from '@/hooks/use-toast';

// Mock data - in real app this would come from an API
const mockStudents: Student[] = [
  {
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
  },
  {
    id: '2',
    school_id: 'school1',
    student_id: 'STU002',
    first_name: 'Michael',
    last_name: 'Chen',
    date_of_birth: '2014-08-22',
    grade: '1',
    gender: 'male',
    emergency_contact_name: 'Lisa Chen',
    emergency_contact_phone: '(555) 987-6543',
    notes: 'Requires additional articulation support',
    active: true,
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z',
  },
  {
    id: '3',
    school_id: 'school1',
    student_id: 'STU003',
    first_name: 'Sofia',
    last_name: 'Rodriguez',
    date_of_birth: '2013-12-05',
    grade: '2',
    gender: 'female',
    emergency_contact_name: 'Maria Rodriguez',
    emergency_contact_phone: '(555) 456-7890',
    notes: '',
    active: true,
    created_at: '2024-01-17T10:00:00Z',
    updated_at: '2024-01-17T10:00:00Z',
  },
];

const StudentTable = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = students.filter(student =>
      student.first_name.toLowerCase().includes(term.toLowerCase()) ||
      student.last_name.toLowerCase().includes(term.toLowerCase()) ||
      student.student_id.toLowerCase().includes(term.toLowerCase()) ||
      (student.grade && student.grade.toLowerCase().includes(term.toLowerCase()))
    );
    setFilteredStudents(filtered);
  };

  const handleAddStudent = (studentData: Partial<Student>) => {
    const newStudent: Student = {
      id: Date.now().toString(),
      school_id: 'school1',
      student_id: studentData.student_id || `STU${Date.now()}`,
      first_name: studentData.first_name || '',
      last_name: studentData.last_name || '',
      date_of_birth: studentData.date_of_birth || '',
      grade: studentData.grade,
      gender: studentData.gender,
      emergency_contact_name: studentData.emergency_contact_name,
      emergency_contact_phone: studentData.emergency_contact_phone,
      notes: studentData.notes,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    setFilteredStudents(updatedStudents);
    setShowAddStudent(false);
    toast({
      title: "Student added",
      description: `${newStudent.first_name} ${newStudent.last_name} has been added successfully.`,
    });
  };

  const handleEditStudent = (studentData: Partial<Student>) => {
    if (!editingStudent) return;

    const updatedStudents = students.map(student =>
      student.id === editingStudent.id
        ? { ...student, ...studentData, updated_at: new Date().toISOString() }
        : student
    );

    setStudents(updatedStudents);
    setFilteredStudents(updatedStudents);
    setEditingStudent(null);
    toast({
      title: "Student updated",
      description: `Student information has been updated successfully.`,
    });
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

  const handleViewStudent = (studentId: string) => {
    navigate(`/students/${studentId}`);
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search students by name, ID, or grade..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            Export
          </Button>
          <Button
            onClick={() => setShowAddStudent(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <StudentFilters
          students={students}
          onFilter={setFilteredStudents}
        />
      )}

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Emergency Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.student_id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {student.first_name} {student.last_name}
                    </div>
                    {student.notes && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {student.notes}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{student.grade || 'N/A'}</TableCell>
                <TableCell>{calculateAge(student.date_of_birth)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{student.emergency_contact_name}</div>
                    <div className="text-gray-500">{student.emergency_contact_phone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={student.active ? "default" : "secondary"}>
                    {student.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="View Profile"
                      onClick={() => handleViewStudent(student.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Edit Student"
                      onClick={() => setEditingStudent(student)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Schedule Screening"
                    >
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No students found matching your search.' : 'No students found.'}
          </div>
        )}
      </Card>

      {/* Add/Edit Student Form */}
      <StudentForm
        isOpen={showAddStudent || !!editingStudent}
        onClose={() => {
          setShowAddStudent(false);
          setEditingStudent(null);
        }}
        onSubmit={editingStudent ? handleEditStudent : handleAddStudent}
        student={editingStudent}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
      />
    </div>
  );
};

export default StudentTable;
