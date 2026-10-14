import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2 } from 'lucide-react'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useDynamicGoalSheet } from '@/hooks/goalSheets/use-dynamic-goal-sheets'
import {
  useUpdateGoalText,
  useDeleteDynamicGoalSheet,
} from '@/hooks/goalSheets/use-dynamic-goal-sheets-mutations'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface DynamicGoalSheetBuilderProps {
  sheetId: string
}
