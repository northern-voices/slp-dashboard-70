
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

export const useManagement = () => {
  const [schoolFormOpen, setSchoolFormOpen] = useState(false);
  const [schoolDetailsOpen, setSchoolDetailsOpen] = useState(false);
  const [userInviteOpen, setUserInviteOpen] = useState(false);
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);
  const [screeningTemplatesOpen, setScreeningTemplatesOpen] = useState(false);
  const [organizationSettingsOpen, setOrganizationSettingsOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schoolSearch, setSchoolSearch] = useState('');

  const [mockSchools, setMockSchools] = useState([
    {
      id: 1,
      name: "Lincoln Elementary School",
      address: "123 Main St, Springfield, IL",
      principal: "Dr. Jane Smith",
      studentCount: 245,
      slpCount: 2,
      status: "active"
    },
    {
      id: 2,
      name: "Washington Middle School",
      address: "456 Oak Ave, Springfield, IL",
      principal: "Mr. John Davis",
      studentCount: 380,
      slpCount: 3,
      status: "active"
    }
  ]);

  const [mockSLPs, setMockSLPs] = useState([
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@district.edu",
      schools: ["Lincoln Elementary", "Roosevelt High"],
      role: "slp",
      status: "active",
      lastActive: "2024-11-20",
      licenseNumber: "SLP-12345"
    },
    {
      id: "2",
      name: "Ms. Emily Chen",
      email: "emily.chen@district.edu",
      schools: ["Washington Middle"],
      role: "supervisor",
      status: "active",
      lastActive: "2024-11-19",
      licenseNumber: "SLP-67890"
    }
  ]);

  const filteredSchools = mockSchools.filter(school =>
    school.name.toLowerCase().includes(schoolSearch.toLowerCase())
  );

  const handleSaveSchool = (schoolData: any) => {
    if (editingSchool) {
      setMockSchools(prev => prev.map(school => 
        school.id === editingSchool.id ? { ...school, ...schoolData } : school
      ));
    } else {
      const newSchool = {
        id: mockSchools.length + 1,
        ...schoolData,
        studentCount: 0,
        slpCount: 0
      };
      setMockSchools(prev => [...prev, newSchool]);
    }
    setEditingSchool(null);
  };

  const handleEditSchool = (school: any) => {
    setEditingSchool(school);
    setSchoolFormOpen(true);
  };

  const handleViewSchoolDetails = (school: any) => {
    setSelectedSchool(school);
    setSchoolDetailsOpen(true);
  };

  const handleEditFromDetails = (school: any) => {
    setSchoolDetailsOpen(false);
    setEditingSchool(school);
    setSchoolFormOpen(true);
  };

  const handleInviteUser = (userData: any) => {
    const newUser = {
      id: (mockSLPs.length + 1).toString(),
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      role: userData.role,
      status: 'pending',
      schools: userData.selectedSchools.map((id: string) => 
        mockSchools.find(school => school.id.toString() === id)?.name || ''
      ).filter(Boolean),
      lastActive: 'Never',
      licenseNumber: userData.licenseNumber
    };
    setMockSLPs(prev => [...prev, newUser]);
  };

  const handleEditUser = (user: any) => {
    console.log('Edit user:', user);
  };

  const handleDeactivateUser = (userId: string) => {
    setMockSLPs(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const handleResendInvite = (userId: string) => {
    console.log('Resend invite to user:', userId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return {
    // State
    schoolFormOpen,
    schoolDetailsOpen,
    userInviteOpen,
    notificationSettingsOpen,
    screeningTemplatesOpen,
    organizationSettingsOpen,
    editingSchool,
    selectedSchool,
    schoolSearch,
    mockSchools,
    mockSLPs,
    filteredSchools,
    
    // Setters
    setSchoolFormOpen,
    setSchoolDetailsOpen,
    setUserInviteOpen,
    setNotificationSettingsOpen,
    setScreeningTemplatesOpen,
    setOrganizationSettingsOpen,
    setEditingSchool,
    setSelectedSchool,
    setSchoolSearch,
    
    // Handlers
    handleSaveSchool,
    handleEditSchool,
    handleViewSchoolDetails,
    handleEditFromDetails,
    handleInviteUser,
    handleEditUser,
    handleDeactivateUser,
    handleResendInvite,
    getStatusBadge
  };
};
