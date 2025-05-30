
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, User, Plus } from 'lucide-react';
import { Database } from '@/types/supabase';

type Student = Database['public']['Tables']['students']['Row'];

// Mock students data - in real app this would come from API
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
    notes: null,
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
    notes: null,
    active: true,
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z',
  },
];

interface StudentSearchSelectorProps {
  selectedStudent: Student | null;
  onStudentSelect: (student: Student | null) => void;
}

const StudentSearchSelector = ({ selectedStudent, onStudentSelect }: StudentSearchSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const results = mockStudents.filter(student =>
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchTerm]);

  const handleStudentSelect = (student: Student) => {
    onStudentSelect(student);
    setSearchTerm(`${student.first_name} ${student.last_name}`);
    setShowResults(false);
  };

  const handleClearSelection = () => {
    onStudentSelect(null);
    setSearchTerm('');
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
    <div className="space-y-4">
      {selectedStudent ? (
        <Card className="p-4 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>ID: {selectedStudent.student_id}</span>
                  <span>•</span>
                  <span>Grade {selectedStudent.grade}</span>
                  <span>•</span>
                  <span>Age {calculateAge(selectedStudent.date_of_birth)}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearSelection}>
              Change Student
            </Button>
          </div>
        </Card>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search for existing student by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {showResults && (
            <Card className="absolute top-full left-0 right-0 mt-1 z-10 max-h-60 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="p-2">
                  {searchResults.map((student) => (
                    <div
                      key={student.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer rounded border-b last:border-b-0"
                      onClick={() => handleStudentSelect(student)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <span>ID: {student.student_id}</span>
                            <Badge variant="outline" className="text-xs">
                              Grade {student.grade}
                            </Badge>
                            <span>Age {calculateAge(student.date_of_birth)}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          Select
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p>No students found matching "{searchTerm}"</p>
                  <p className="text-sm mt-1">You can create a new student profile during screening</p>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentSearchSelector;
