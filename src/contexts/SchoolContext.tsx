
import React, { createContext, useContext, useState, useEffect } from 'react';
import { School } from '@/types/database';
import { useOrganization } from './OrganizationContext';

interface SchoolContextType {
  selectedSchool: School | null;
  setSelectedSchool: (school: School | null) => void;
  userAssignedSchools: School[];
  isLoading: boolean;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};

interface SchoolProviderProps {
  children: React.ReactNode;
}

export const SchoolProvider: React.FC<SchoolProviderProps> = ({ children }) => {
  const { userProfile, availableSchools, isLoading: orgLoading } = useOrganization();
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [userAssignedSchools, setUserAssignedSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orgLoading && userProfile && availableSchools) {
      // For SLPs, simulate assigned schools (in real app, this would come from backend)
      // For now, assign them to all schools, but in production this would be filtered
      if (userProfile.role === 'slp') {
        setUserAssignedSchools(availableSchools);
        if (availableSchools.length > 0 && !selectedSchool) {
          setSelectedSchool(availableSchools[0]);
        }
      } else {
        // Admins and supervisors can see all schools
        setUserAssignedSchools(availableSchools);
      }
      setIsLoading(false);
    }
  }, [orgLoading, userProfile, availableSchools, selectedSchool]);

  const value: SchoolContextType = {
    selectedSchool,
    setSelectedSchool,
    userAssignedSchools,
    isLoading
  };

  return (
    <SchoolContext.Provider value={value}>
      {children}
    </SchoolContext.Provider>
  );
};
