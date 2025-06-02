
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, Phone, Mail } from 'lucide-react';
import { useSchool } from '@/contexts/SchoolContext';
import { useNavigate } from 'react-router-dom';

const SLPSchoolBrowser = () => {
  const { userAssignedSchools, setSelectedSchool, isLoading } = useSchool();
  const navigate = useNavigate();

  const handleViewStudents = (school: any) => {
    setSelectedSchool(school);
    navigate('/students');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">My Assigned Schools</h2>
          <p className="text-gray-600 text-sm">Schools where you can manage students and conduct screenings</p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {userAssignedSchools.length} Schools Assigned
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {userAssignedSchools.map((school) => (
          <Card key={school.id} className="hover:shadow-md transition-shadow border border-gray-100">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{school.name}</CardTitle>
                    <p className="text-sm text-gray-600">{school.address}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Students: ~150</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">K-12</span>
                </div>
              </div>

              {school.principal_name && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900">Principal Contact</h4>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{school.principal_name}</span>
                    </div>
                    {school.principal_email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{school.principal_email}</span>
                      </div>
                    )}
                    {school.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{school.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewStudents(school)}
                  className="flex-1"
                >
                  View Students
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedSchool(school)}
                  className="flex-1"
                >
                  Select School
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SLPSchoolBrowser;
