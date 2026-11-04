import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BulkDocumentData, DocumentData, documentsApi } from '@/api/documents'

export const useDocuments = (studentId: string) => {
  return useQuery({
    queryKey: ['documents', studentId],
    queryFn: () => documentsApi.getDocuments(studentId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useUploadDocument = (studentId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: DocumentData) => documentsApi.uploadDocument(studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', studentId] })
    },
  })
}

export const useBulkUploadDocuments = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkDocumentData) => documentsApi.uploadDocumentsBulk(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export const useDeleteDocument = (studentId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, filePath }: { id: string; filePath: string | null }) =>
      documentsApi.deleteDocument(id, filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', studentId] })
    },
  })
}

export const useDocumentsBySchool = (schoolId?: string) => {
  return useQuery({
    queryKey: ['documents', 'by-school', schoolId],
    queryFn: () => documentsApi.getDocumentsBySchool(schoolId!),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useUpdateDocumentFileName = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, fileName }: { id: string; fileName: string }) =>
      documentsApi.updateDocumentFileName(id, fileName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}
