import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import { Organization, School, SLPProfile } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface OrganizationContextType {
  currentOrganization: Organization | null
  currentSchool: School | null
  userProfile: SLPProfile | null
  availableSchools: School[]
  isLoading: boolean
  setCurrentSchool: (school: School | null) => void
  clearCurrentSchool: () => void
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
  const [availableSchools, setAvailableSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  // Use localStorage to persist the selected school
  const [currentSchool, setCurrentSchoolState] = useLocalStorage<School | null>(
    'selectedSchool',
    null
  )

  // Store the setter function in a ref to prevent recreation
  const setCurrentSchoolStateRef = useRef(setCurrentSchoolState)
  setCurrentSchoolStateRef.current = setCurrentSchoolState

  const { user } = useAuth()

  // Memoized functions to prevent recreation on every render
  const setCurrentSchool = useCallback((school: School | null) => {
    setCurrentSchoolStateRef.current(school)
  }, [])

  const clearCurrentSchool = useCallback(() => {
    setCurrentSchoolStateRef.current(null)
  }, [])

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
        license_number: '',
        role: userData.role,
        active: true,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
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
      }

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
        primary_slp_id: school.primary_slp_id || null,
        created_at: school.created_at,
        updated_at: school.updated_at,
      }))

      setAvailableSchools(transformedSchools)

      // Validate and restore persisted school if it exists
      // Use the current value from state, not the parameter
      const currentSchoolValue = currentSchool
      if (currentSchoolValue) {
        const isValidSchool = transformedSchools.find(s => s.id === currentSchoolValue.id)
        if (!isValidSchool) {
          clearCurrentSchool()
        }
      }

      setIsInitialized(true)
    } catch (error) {
      console.error('Error loading organization data:', error)
      // Reset states on error
      setCurrentOrganization(null)
      setUserProfile(null)
      setAvailableSchools([])
      clearCurrentSchool()
      setIsInitialized(true)
    } finally {
      setIsLoading(false)
    }
  }, [user, clearCurrentSchool]) // Remove currentSchool dependency

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
      setAvailableSchools([])
      clearCurrentSchool()
      setIsLoading(false)
      setIsInitialized(false)
    }
  }, [user, clearCurrentSchool])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      currentOrganization,
      currentSchool,
      userProfile,
      availableSchools,
      isLoading: isLoading || !isInitialized,
      setCurrentSchool,
      clearCurrentSchool,
      refreshData,
    }),
    [
      currentOrganization,
      currentSchool,
      userProfile,
      availableSchools,
      isLoading,
      isInitialized,
      setCurrentSchool,
      clearCurrentSchool,
      refreshData,
    ]
  )

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
}
