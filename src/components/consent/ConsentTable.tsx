import { useMemo, useState } from 'react'
import { Search, FileText, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  ResponsiveTable,
  ResponsiveTableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/responsive-table'
import { format } from 'date-fns'
import ConsentFormDetailsModal from '@/components/students/ConsentFormDetailsModal'
import { ConsentFormWithStudent } from '@/api/consentForms'

interface ConsentTableProps {
  forms: ConsentFormWithStudent[]
  isLoading: boolean
}
