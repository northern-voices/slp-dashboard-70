import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import StudentSearchSelector from '@/components/screening/StudentSearchSelector'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useStudent } from '@/hooks/students/use-students'
import { useCreateDynamicGoalSheet } from '@/hooks/goalSheets/use-dynamic-goal-sheets-mutations'
import { useToast } from '@/hooks/use-toast'
import type { Student } from '@/types/database'

interface DynamicGoalSheetCreateFormProps {
  lockedStudentId?: string
}
