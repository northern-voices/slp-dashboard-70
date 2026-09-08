import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import MultiEmailInput from '@/components/reports/shared/MultiEmailInput'
import ReportPasswordInput from '@/components/reports/shared/ReportPasswordInput'
import { edgeFunctionsApi } from '@/api/edgeFunctions'
import { useToast } from '@/hooks/use-toast'

interface CaseloadRow {
  name: string
  grade: string
  result: string
  consent: string
  speech_ea: string
}

interface EmailCaseloadReportModalProps {
  isOpen: boolean
  onClose: () => void
  schoolId: string
  academicYear: string
  qualifiedStudents: CaseloadRow[]
  subStudents: CaseloadRow[]
}
