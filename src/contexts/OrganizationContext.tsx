
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';

interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface School {
  id: string;
  organization_id: string;
  name: string;
  address?: string;
  principal_name?: string;
  principal_email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

interface SLPProfile {
  id: string;
  user_id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  license_number?: string;
  role: 'slp' | 'admin' | 'supervisor';
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  currentSchool: School | null;
  userProfile: SLPProfile | null;
  availableSchools: School[];
  isLoading: boolean;
  isAuthenticated: boolean;
  setCurrentSchool: (school: School | null) => void;
  refreshData: () => Promise<void>;
  signOut: () => Promise<void>;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Check authentication status
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAuthenticated(false);
        setCurrentOrganization(null);
        setUserProfile(null);
        setAvailableSchools([]);
        setCurrentSchool(null);
        return;
      }

      setIsAuthenticated(true);

      // Get user profile
      const profile = await supabaseService.getCurrentUserProfile();
      setUserProfile(profile);

      // Get current organization
      const organization = await supabaseService.getCurrentUserOrganization();
      setCurrentOrganization(organization);

      // Get available schools
      const schools = await supabaseService.getSchools(organization.id);
      setAvailableSchools(schools);
      
      // Set the first school as default if none selected and user has access
      if (!currentSchool && schools.length > 0) {
        // For admins, set first school. For others, check assignments
        if (profile.role === 'admin') {
          setCurrentSchool(schools[0]);
        } else {
          // Get school assignments for current user
          const assignments = await supabaseService.getSchoolAssignments(profile.id);
          const assignedSchool = schools.find(school => 
            assignments.some(assignment => assignment.school_id === school.id)
          );
          if (assignedSchool) {
            setCurrentSchool(assignedSchool);
          }
        }
      }
    } catch (error) {
      console.error('Error loading organization data:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setCurrentOrganization(null);
    setUserProfile(null);
    setAvailableSchools([]);
    setCurrentSchool(null);
  };

  useEffect(() => {
    refreshData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        refreshData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: OrganizationContextType = {
    currentOrganization,
    currentSchool,
    userProfile,
    availableSchools,
    isLoading,
    isAuthenticated,
    setCurrentSchool,
    refreshData,
    signOut,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
