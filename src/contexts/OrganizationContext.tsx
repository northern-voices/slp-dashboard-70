
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
        name: 'NVSS',
        slug: 'nvss',
        address: '1234 Professional Drive',
        city: 'Las Vegas',
        state: 'NV',
        zip: '89144',
        phone: '(702) 555-0100',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockProfile: SLPProfile = {
        id: '1',
        user_id: '1',
        organization_id: '1',
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@nvss.com',
        license_number: 'ADMIN-12345',
        role: 'admin',
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        organization: mockOrganization,
      };

      const mockSchools: School[] = [
        {
          id: '1',
          organization_id: '1',
          name: 'Westfield Elementary School',
          address: '425 Oak Street',
          city: 'Las Vegas',
          state: 'NV',
          zip: '89101',
          principal_name: 'Maria Rodriguez',
          principal_email: 'm.rodriguez@ccsd.net',
          phone: '(702) 799-3420',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          organization_id: '1',
          name: 'Desert Pines High School',
          address: '3800 E Harris Avenue',
          city: 'Las Vegas',
          state: 'NV',
          zip: '89110',
          principal_name: 'Robert Chen',
          principal_email: 'r.chen@ccsd.net',
          phone: '(702) 799-6830',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          organization_id: '1',
          name: 'Valley View Middle School',
          address: '8250 Spring Mountain Road',
          city: 'Las Vegas',
          state: 'NV',
          zip: '89117',
          principal_name: 'Jennifer Walsh',
          principal_email: 'j.walsh@ccsd.net',
          phone: '(702) 799-7980',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '4',
          organization_id: '1',
          name: 'Sunrise Elementary School',
          address: '5757 E Tropicana Avenue',
          city: 'Las Vegas',
          state: 'NV',
          zip: '89122',
          principal_name: 'David Thompson',
          principal_email: 'd.thompson@ccsd.net',
          phone: '(702) 799-5420',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '5',
          organization_id: '1',
          name: 'NVSS Therapy Center',
          address: '1234 Professional Drive',
          city: 'Las Vegas',
          state: 'NV',
          zip: '89144',
          principal_name: 'Dr. Lisa Martinez',
          principal_email: 'l.martinez@nvss.com',
          phone: '(702) 555-0100',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
