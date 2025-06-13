import React, { createContext, useContext, useState, useEffect } from 'react'
import { Organization, School, SLPProfile } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface OrganizationContextType {
  currentOrganization: Organization | null
  currentSchool: School | null
  userProfile: SLPProfile | null
  availableSchools: School[]
  isLoading: boolean
  setCurrentSchool: (school: School | null) => void
  refreshData: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export const useOrganization = () => {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}

interface OrganizationProviderProps {
  children: React.ReactNode
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children }) => {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [currentSchool, setCurrentSchool] = useState<School | null>(null)
  const [userProfile, setUserProfile] = useState<SLPProfile | null>(null)
  const [availableSchools, setAvailableSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { user } = useAuth()

  const refreshData = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      // Fetch user profile with organization data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(
          `
          *,
          organization:organizations(*)
        `
        )
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('Error fetching user data:', userError)
        throw userError
      }

      if (!userData) {
        console.error('No user data found')
        return
      }

      console.log(userData, 'userData')

      // Transform the user data to match your SLPProfile interface
      // TODO: Adjust this mapping based on your actual SLPProfile type
      const transformedProfile: SLPProfile = {
        id: userData.id,
        user_id: userData.id,
        organization_id: userData.organization_id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        license_number: '', // TODO: This field doesn't exist in schema, add it or remove from type
        role: userData.role,
        active: userData.is_active,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        organization: userData.organization,
      }

      // Transform organization data to match your Organization interface
      const transformedOrganization: Organization = {
        id: userData.organization.id,
        name: userData.organization.name,
        slug: '', // TODO: This field doesn't exist in schema
        address: '', // TODO: These fields don't exist in schema
        city: '',
        state: '',
        zip: '',
        phone: '',
        created_at: userData.organization.created_at,
        updated_at: userData.organization.updated_at,
      }

      setUserProfile(transformedProfile)
      setCurrentOrganization(transformedOrganization)

      // Fetch available schools for the organization
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('*')
        .eq('organization_id', userData.organization_id)
        .order('name')

      if (schoolsError) {
        console.error('Error fetching schools:', schoolsError)
        throw schoolsError
      }

      // Transform schools data to match your School interface
      const transformedSchools: School[] = (schoolsData || []).map(school => ({
        id: school.id,
        organization_id: school.organization_id,
        name: school.name,
        address: school.street_address,
        city: school.city,
        state: school.region || '',
        zip: school.postal_code || '',
        principal_name: school.principal_name || '',
        principal_email: school.principal_email || '',
        phone: school.phone || '',
        created_at: school.created_at,
        updated_at: school.updated_at,
      }))

      setAvailableSchools(transformedSchools)

      // Set the first school as default if none selected and schools exist
      if (!currentSchool && transformedSchools.length > 0) {
        setCurrentSchool(transformedSchools[0])
      }
    } catch (error) {
      console.error('Error loading organization data:', error)
      // Reset states on error
      setCurrentOrganization(null)
      setUserProfile(null)
      setAvailableSchools([])
      setCurrentSchool(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh data when user changes
  useEffect(() => {
    refreshData()
  }, [user?.id])

  // Reset data when user logs out
  useEffect(() => {
    if (!user) {
      setCurrentOrganization(null)
      setUserProfile(null)
      setAvailableSchools([])
      setCurrentSchool(null)
      setIsLoading(false)
    }
  }, [user])

  const value: OrganizationContextType = {
    currentOrganization,
    currentSchool,
    userProfile,
    availableSchools,
    isLoading,
    setCurrentSchool,
    refreshData,
  }

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
}
