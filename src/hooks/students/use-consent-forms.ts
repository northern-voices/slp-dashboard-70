import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { consentFormsApi } from '@/api/consentForms'

export const useConsentForms = (studentId: string) => {
  return useQuery({
    queryKey: ['consent-forms', studentId],
    queryFn: () => consentFormsApi.getConsentForms(studentId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  })
}
