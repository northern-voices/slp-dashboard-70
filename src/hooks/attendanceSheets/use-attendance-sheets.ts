import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceSheetsApi, AttendanceSheetData } from '@/api/attendanceSheets'

export const useAttendanceSheets = (schoolId: string) => {
  return useQuery({
    queryKey: ['attendance-sheets', schoolId],
    queryFn: () => attendanceSheetsApi.getAttendanceSheets(schoolId),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useUploadAttendanceSheet = (schoolId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AttendanceSheetData) =>
      attendanceSheetsApi.uploadAttendanceSheet(schoolId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-sheets', schoolId] })
    },
  })
}

export const useDeleteAttendanceSheet = (schoolId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, filePath }: { id: string; filePath: string | null }) =>
      attendanceSheetsApi.deleteAttendanceSheet(id, filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-sheets', schoolId] })
    },
  })
}
