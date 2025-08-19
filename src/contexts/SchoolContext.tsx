import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { School } from '@/types/database'
import { useOrganization } from './OrganizationContext'

interface SchoolContextType {
  selectedSchool: School | null
  setSelectedSchool: (school: School | null) => void
  userAssignedSchools: School[]
  isLoading: boolean
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined)

export const useSchool = () => {
  const context = useContext(SchoolContext)
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider')
  }
  return context
}

interface SchoolProviderProps {
  children: React.ReactNode
}

export const SchoolProvider: React.FC<SchoolProviderProps> = ({ children }) => {
  const {
    userProfile,
    availableSchools,
    currentSchool,
    isLoading: orgLoading,
    setCurrentSchool,
  } = useOrganization()
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [userAssignedSchools, setUserAssignedSchools] = useState<School[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!orgLoading && userProfile && availableSchools) {
      // For all users, assign them to available schools
      setUserAssignedSchools(availableSchools)

      // Only set a default school if this is the first initialization and no school is selected
      if (
        !hasInitialized.current &&
        availableSchools.length > 0 &&
        !selectedSchool &&
        !currentSchool
      ) {
        const defaultSchool = availableSchools[0]
        setSelectedSchool(defaultSchool)
        setCurrentSchool(defaultSchool)
        hasInitialized.current = true
      } else if (currentSchool && !selectedSchool) {
        // If OrganizationContext has a currentSchool but SchoolContext doesn't, sync them
        setSelectedSchool(currentSchool)
        hasInitialized.current = true
      } else if (selectedSchool && !currentSchool) {
        // If SchoolContext has a selectedSchool but OrganizationContext doesn't, sync them
        setCurrentSchool(selectedSchool)
        hasInitialized.current = true
      } else if (hasInitialized.current) {
        // If we've already initialized, don't change anything unless explicitly requested
      } else {
        hasInitialized.current = true
      }

      setIsLoading(false)
    }
  }, [orgLoading, userProfile, availableSchools, setCurrentSchool, selectedSchool, currentSchool])

  // Custom setter that updates both contexts
  const handleSetSelectedSchool = (school: School | null) => {
    setSelectedSchool(school)
    // Also update the OrganizationContext's currentSchool
    setCurrentSchool(school)
  }

  const value: SchoolContextType = {
    selectedSchool,
    setSelectedSchool: handleSetSelectedSchool,
    userAssignedSchools,
    isLoading,
  }

  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>
}
