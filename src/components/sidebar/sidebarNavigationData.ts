import { Home, BarChart3, Building2, GraduationCap, HandHeart, Stethoscope } from 'lucide-react'
import { Location } from 'react-router-dom'
import { LucideIcon } from 'lucide-react'

export interface NavigationItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
}

export interface NavigationGroup {
  label: string
  items: NavigationItem[]
}

export const getNavigationGroups = (
  location: Location,
  userRole: string,
  userProfile: Record<string, unknown> | null,
  currentSchool?: { id: string; name?: string } | null
): NavigationGroup[] => {
  // Determine if we should use school-specific routes
  const useSchoolRoutes = currentSchool && currentSchool.id

  const mainItems: NavigationItem[] = [
    {
      title: 'Dashboard',
      url: useSchoolRoutes ? `/school/${currentSchool.id}` : '/',
      icon: Home,
      isActive:
        location.pathname === '/' ||
        (useSchoolRoutes && location.pathname === `/school/${currentSchool.id}`),
    },
    {
      title: 'Students',
      url: useSchoolRoutes ? `/school/${currentSchool.id}/students` : '/students',
      icon: GraduationCap,
      isActive:
        location.pathname.startsWith('/students') ||
        (useSchoolRoutes && location.pathname.startsWith(`/school/${currentSchool.id}/students`)),
    },
    {
      title: 'Speech Screenings',
      url: useSchoolRoutes ? `/school/${currentSchool.id}/screenings` : '/screenings',
      icon: Stethoscope,
      isActive:
        location.pathname === '/screenings' ||
        (useSchoolRoutes && location.pathname === `/school/${currentSchool.id}/screenings`),
    },
    {
      title: 'Speech Screening Reports',
      url: useSchoolRoutes
        ? `/school/${currentSchool.id}/speech-screening-reports`
        : '/speech-screening-reports',
      icon: BarChart3,
      isActive:
        location.pathname === '/speech-screening-reports' ||
        (useSchoolRoutes &&
          location.pathname.startsWith(`/school/${currentSchool.id}/speech-screening-reports`)),
    },
    // {
    //   title: 'School Support',
    //   url: useSchoolRoutes ? `/school/${currentSchool.id}/school-support` : '/school-support',
    //   icon: HandHeart,
    //   isActive:
    //     location.pathname.startsWith('/school-support') ||
    //     (useSchoolRoutes &&
    //       location.pathname.startsWith(`/school/${currentSchool.id}/school-support`)),
    // },
    // {
    //   title: 'Management',
    //   url: useSchoolRoutes ? `/school/${currentSchool.id}/management` : '/management',
    //   icon: Building2,
    //   isActive:
    //     location.pathname === '/management' ||
    //     (useSchoolRoutes && location.pathname === `/school/${currentSchool.id}/management`),
    // },
  ]

  const groups: NavigationGroup[] = [
    {
      label: 'Main Menu',
      items: mainItems,
    },
  ]

  return groups
}
