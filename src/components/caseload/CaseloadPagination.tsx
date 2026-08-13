import { Dispatch, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CaseloadPaginationProps {
  itemsPerPage: number | 'all'
  setItemsPerPage: Dispatch<SetStateAction<number | 'all'>>
  currentPage: number
  setCurrentPage: Dispatch<SetStateAction<number>>
  totalPages: number
  startIndex: number
  effectiveItemsPerPage: number
  totalStudents: number
}
