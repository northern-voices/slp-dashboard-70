import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSchoolTransfers } from '@/hooks/students/use-students'
import {
  ResponsiveTable,
  ResponsiveTableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/responsive-table'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface TransferredStudentsTableProps {
  schoolId?: string
}
