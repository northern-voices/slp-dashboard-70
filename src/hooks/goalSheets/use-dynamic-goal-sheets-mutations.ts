import { useMutation, useQueryClient } from '@tanstack/react-query'
import { dynamicGoalSheetsApi } from '@/api/dynamicGoalSheets'
import type { DynamicGoalSheetWithSessions } from '@/types/database'

type CreateDynamicGoalSheetInput = {
  studentId: string
  schoolId: string
  goalText: string
}
