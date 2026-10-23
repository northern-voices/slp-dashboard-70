import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { Organization, School, SLPProfile } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface OrganizationContextType {
  currentOrganization: Organization | null
  userProfile: SLPProfile | null
  availableSchools: School[]
  updateAvailableSchool: (school: School) => void
  isLoading: boolean
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
  const [userProfile, setUserProfile] = useState<SLPProfile | null>(null)
  const [availableSchools, setAvailableSchoolsState] = useLocalStorage<School[]>(
    'availableSchools',
    []
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  const { user } = useAuth()

  const refreshData = useCallback(async () => {
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

      // Transform the user data to match your SLPProfile interface
      const transformedProfile: SLPProfile = {
        id: userData.id,
        user_id: userData.id,
        organization_id: userData.organization_id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone: userData.phone || '',
        license_number: '',
        role: userData.role,
        active: true,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        default_report_password: userData.default_report_password ?? null,
      }

      setUserProfile(transformedProfile)

      // Fetch organization data
      const { data: organizationData, error: organizationError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', userData.organization_id)
        .single()

      if (organizationError) {
        console.error('Error fetching organization data:', organizationError)
        throw organizationError
      }

      if (!organizationData) {
        console.error('No organization data found')
        return
      }

      // Transform organization data to match your Organization interface
      const transformedOrganization: Organization = {
        id: organizationData.id,
        name: organizationData.name,
        slug: organizationData.slug || '',
        address: organizationData.street_address || '',
        city: organizationData.city || '',
        state: organizationData.region || '',
        zip: organizationData.postal_code || '',
        phone: organizationData.phone || '',
        created_at: organizationData.created_at,
        updated_at: organizationData.updated_at,
        default_report_password: organizationData.default_report_password ?? null,
      }

      setCurrentOrganization(transformedOrganization)

      const isRestrictedRole = userData.role === 'slp' || userData.role === 'hearing_technician'

      let schoolsQuery = supabase
        .from('schools')
        .select('*, primary_slp:users!primary_slp_id(first_name, last_name)')
        .eq('organization_id', userData.organization_id)
        .order('name')

      if (isRestrictedRole) {
        const { data: assignments } = await supabase
          .from('user_school_assignments')
          .select('school_id')
          .eq('user_id', user.id)

        const assignedSchoolIds = (assignments || []).map(a => a.school_id)

        if (assignedSchoolIds.length === 0) {
          setAvailableSchoolsState([])
          setIsInitialized(true)
          return
        }

        schoolsQuery = schoolsQuery.in('id', assignedSchoolIds)
      }

      // Fetch available schools for the organization
      const { data: schoolsData, error: schoolsError } = await schoolsQuery

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
        primary_slp_id: school.primary_slp_id || null,
        primary_slp: school.primary_slp || null,
        created_at: school.created_at,
        updated_at: school.updated_at,
      }))

      setAvailableSchoolsState(transformedSchools)
      setIsInitialized(true)
    } catch (error) {
      console.error('Error loading organization data:', error)
      setIsInitialized(true)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const updateAvailableSchool = useCallback(
    (updatedSchool: School) => {
      setAvailableSchoolsState(prev =>
        prev.map(school => (school.id === updatedSchool?.id ? updatedSchool : school))
      )
    },
    [setAvailableSchoolsState]
  )

  // Only fetch data once when user changes
  useEffect(() => {
    if (user?.id && !isInitialized) {
      refreshData()
    }
  }, [user?.id, isInitialized, refreshData])

  // Reset data when user logs out
  useEffect(() => {
    if (!user) {
      setCurrentOrganization(null)
      setUserProfile(null)
      setIsLoading(false)
      setIsInitialized(false)
    }
  }, [user])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      currentOrganization,
      userProfile,
      availableSchools,
      isLoading: isLoading || !isInitialized,
      refreshData,
      updateAvailableSchool,
    }),
    [
      currentOrganization,
      userProfile,
      availableSchools,
      isLoading,
      isInitialized,
      refreshData,
      updateAvailableSchool,
    ]
  )

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
}
