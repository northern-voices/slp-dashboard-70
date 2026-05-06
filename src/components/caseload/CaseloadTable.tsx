import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ChevronUp, ChevronDown, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ResponsiveTable,
  ResponsiveTableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/responsive-table'
import { GRADE_MAPPING } from '@/constants/app'
import { Student } from '@/types/database'
import { schoolGradesApi, type SchoolGrade } from '@/api/schoolGrades'
import { useSchoolDetails } from '@/hooks/school/useSchoolDetails'
import { useOrganization } from '@/contexts/OrganizationContext'

interface CaseloadTableProps {
  students: Student[]
  isLoading: boolean
  schoolId?: string
}

const CaseloadTable = ({ students, isLoading, schoolId }: CaseloadTableProps) => {
  const [gradesMap, setGradesMap] = useState<Map<string, SchoolGrade>>(new Map())
  const [sortField, setSortField] = useState<'grade' | 'program_status' | null>('program_status')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(50)

  useEffect(() => {
    const fetchGrades = async () => {
      if (!schoolId) return setGradesMap(new Map())

      try {
        const grades = await schoolGradesApi.getSchoolGradesBySchool(schoolId)
        const map = new Map<string, SchoolGrade>()

        grades.forEach(grade => map.set(grade.id, grade))

        setGradesMap(map)
      } catch {
        setGradesMap(new Map())
      }
    }

    fetchGrades()
  }, [schoolId])

  const { currentSchool } = useOrganization()
  const { data: schoolDetails } = useSchoolDetails(currentSchool ?? null)

  const speechEAs =
    schoolDetails?.schoolTeam?.filter(member => member.roles.includes('speech_ea')) ?? []

  const getSpeechEAName = (student: Student): string => {
    if (!student.speech_ea_id) return '-'

    return speechEAs.find(ea => ea.id === student.speech_ea_id)?.name ?? '-'
  }

  const getStudentGrade = (student: Student): string => {
    if (student.current_grade_id) {
      const grade = gradesMap.get(student.current_grade_id)
      if (grade) return grade.grade_level
    }

    return 'N/A'
  }

  const getProgramStatus = (student: Student): string => {
    if (student.service_status === 'graduated') return 'graduated'
    if (student.service_status === 'paused') return 'paused'
    if (student.service_status === 'transferred') return 'transferred'
    return student.program_status || 'none'
  }

  const getProgramBadge = (student: Student) => {
    switch (getProgramStatus(student)) {
      case 'graduated':
        return <Badge className='bg-blue-100 text-blue font-medium text-[10px]'>Graduated</Badge>
      case 'paused':
        return <Badge className='bg-purple-100 text-purple font-medium text-[10px]'>Paused</Badge>
      case 'sub':
        return <Badge className='bg-orange-100 text-orange font-medium text-[10px]'>Sub</Badge>
      case 'qualified':
        return <Badge className='bg-red-100 text-red font-medium text-[10px]'>Qualified</Badge>
      case 'not_in_program':
        return (
          <Badge className='bg-green-100 text-green font-medium text-[10px]'>Not In Program</Badge>
        )
      default:
        return <Badge className='bg-gray-100 text-gray font-medium text-[10px]'>Not Set</Badge>
    }
  }

  const getStatusBadge = (student: Student) => {
    switch (student.service_status) {
      case 'graduated':
        return (
          <Badge className='bg-blue-100 text-blue-800 font-medium text-[10px]'>Graduated</Badge>
        )
      case 'paused':
        return (
          <Badge className='bg-purple-100 text-purple-800 font-medium text-[10px]'>Paused</Badge>
        )
      case 'transferred':
        return (
          <Badge className='bg-gray-100 text-gray-800 font-medium text-[10px]'>Transferred</Badge>
        )
      default:
        return <Badge className='bg-green-100 text-green-800 font-medium text-[10px]'>Active</Badge>
    }
  }

  const handleSort = (field: 'grade' | 'program_status') => {
    if (sortField !== field) {
      setSortField(field)
      setSortOrder('desc')
    } else if (sortOrder === 'desc') {
      setSortOrder('asc')
    } else {
      setSortField(null)
      setSortOrder(null)
    }

    setCurrentPage(1)
  }

  const getSortIcon = (field: 'grade' | 'program_status') => {
    if (sortField !== field) return <ChevronUp className='w-4 h-4 opacity-30' />
    if (sortOrder === 'asc') return <ChevronUp className='w-4 h-4' />

    return <ChevronDown className='w-4 h-4' />
  }
}
