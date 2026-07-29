import { useOrganization } from '@/contexts/OrganizationContext'

export const useDefaultReportPassword = () => {
  const { userProfile, currentOrganization } = useOrganization()

  return userProfile?.default_report_password || currentOrganization.default_report_password || ''
}
