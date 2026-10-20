import { FileSearch } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ResultBadge } from '@/components/caseload/CaseloadBadges'
import { useSpeechScreeningsByStudent } from '@/hooks/screenings'
import { parseDateSafely } from '@/utils/dateUtils'

interface StudentScreeningSheetProps {
  studentId?: string
  studentName: string
}
