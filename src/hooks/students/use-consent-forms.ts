import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ConsentFormData, consentFormsApi } from '@/api/consentForms'

export const useConsentForms = (studentId: string) => {
  return useQuery({
    queryKey: ['consent-forms', studentId],
    queryFn: () => consentFormsApi.getConsentForms(studentId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useUploadConsentForm = (studentId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: ConsentFormData) =>
      consentFormsApi.uploadConsentForm(studentId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['consent-forms', studentId],
      })
    },
  })
}

export const useDeleteConsentForm = (studentId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, filePath }: { id: string; filePath: string | null }) =>
      consentFormsApi.deleteConsentForm(id, filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consent-forms', studentId] })
    },
  })
}

export const useConsentFormPresence = (studentIds: string[]) => {
  return useQuery({
    queryKey: ['consent-form-presence', studentIds],
    queryFn: () => consentFormsApi.getConsentFormPresenceByStudentIds(studentIds),
    enabled: studentIds.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}
