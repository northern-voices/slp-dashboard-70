
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Organization, School, SLPProfile } from '@/types/database';

interface OrganizationContextType {
  currentOrganization: Organization | null;
  currentSchool: School | null;
  userProfile: SLPProfile | null;
  availableSchools: School[];
  isLoading: boolean;
  setCurrentSchool: (school: School | null) => void;
  refreshData: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

interface OrganizationProviderProps {
  children: React.ReactNode;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children }) => {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [userProfile, setUserProfile] = useState<SLPProfile | null>(null);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual Supabase calls when integration is ready
      // For now, using mock data
      const mockOrganization: Organization = {
        id: '1',
        name: 'Springfield School District',
        slug: 'springfield-sd',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockProfile: SLPProfile = {
        id: '1',
        user_id: '1',
        organization_id: '1',
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@springfield.edu',
        license_number: 'SLP-12345',
        role: 'slp',
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        organization: mockOrganization,
      };

      const mockSchools: School[] = [
        {
          id: '1',
          organization_id: '1',
          name: 'Springfield Elementary',
          address: '123 Main St, Springfield, IL',
          principal_name: 'John Smith',
          principal_email: 'j.smith@springfield.edu',
          phone: '(555) 123-4567',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          organization: mockOrganization,
        },
        {
          id: '2',
          organization_id: '1',
          name: 'Springfield Middle School',
          address: '456 Oak Ave, Springfield, IL',
          principal_name: 'Jane Doe',
          principal_email: 'j.doe@springfield.edu',
          phone: '(555) 123-4568',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          organization: mockOrganization,
        },
        {
          id: '3',
          organization_id: '1',
          name: 'Springfield High School',
          address: '789 Pine Blvd, Springfield, IL',
          principal_name: 'Mike Wilson',
          principal_email: 'm.wilson@springfield.edu',
          phone: '(555) 123-4569',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          organization: mockOrganization,
        }
      ];

      setCurrentOrganization(mockOrganization);
      setUserProfile(mockProfile);
      setAvailableSchools(mockSchools);
      
      // Set the first school as default if none selected
      if (!currentSchool && mockSchools.length > 0) {
        setCurrentSchool(mockSchools[0]);
      }
    } catch (error) {
      console.error('Error loading organization data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const value: OrganizationContextType = {
    currentOrganization,
    currentSchool,
    userProfile,
    availableSchools,
    isLoading,
    setCurrentSchool,
    refreshData,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
