import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsApi, DocumentType, DocumentData } from '@/api/documents'

export const useDocuments = (schoolId: string, type?: DocumentType) => {
  return useQuery({
    queryKey: ['documents', schoolId, type],
    queryFn: () => documentsApi.getDocuments(schoolId, type),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useUploadDocument = (schoolId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ type, data }: { type: DocumentType; data: DocumentData }) =>
      documentsApi.uploadDocument(schoolId, type, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', schoolId] })
    },
  })
}

export const useDeleteDocument = (schoolId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, filePath }: { id: string; filePath: string }) =>
      documentsApi.deleteDocument(id, filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', schoolId] })
    },
  })
}
