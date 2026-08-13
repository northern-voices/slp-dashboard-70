import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  ResponsiveTable,
  TableHeader,
  TableHead,
  TableBody,
} from '@/components/ui/responsive-table'
import { Student } from '@/types/database'
import CaseloadStats from './CaseloadStats'
import CaseloadFilters from './CaseloadFilter'
import CaseloadTableRow from './CaseloadTableRow'
import CaseloadPagination from './CaseloadPagination'
import CaseloadDialogs from './CaseloadDialogs'
import SortControls, { SortOption } from '@/components/ui/SortControls'
import { useCaseloadTableData } from './useCaseloadTableData'
import { useCaseloadTableActions } from './useCaseloadTableActions'

interface CaseloadTableProps {
  students: Student[]
  isLoading: boolean
  schoolId?: string
}

const sortOptions: SortOption[] = [
  { label: 'Student', value: 'name', defaultDirection: 'asc' },
  { label: 'Grade', value: 'grade', defaultDirection: 'asc' },
  { label: 'Program Status', value: 'program_status', defaultDirection: 'asc' },
  { label: 'Result', value: 'result', defaultDirection: 'asc' },
  { label: 'Consent', value: 'consent', defaultDirection: 'asc' },
  { label: 'Speech EA', value: 'speech_ea', defaultDirection: 'asc' },
]

const CaseloadTable = ({ students, isLoading, schoolId }: CaseloadTableProps) => {
  const navigate = useNavigate()

  const handleNavigate = (path: string) => {
    if (schoolId) {
      navigate(`/school/${schoolId}/students/${path}`)
    } else {
      navigate(`/students/${path}`)
    }
  }

  const {
    gradesMap,
    speechEAs,
    refetchSchoolDetails,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    gradeFilter,
    setGradeFilter,
    resultFilter,
    setResultFilter,
    consentFilter,
    setConsentFilter,
    eaFilter,
    setEaFilter,
    dateFilter,
    setDateFilter,
    programStatusFilter,
    setProgramStatusFilter,
    searchTerm,
    setSearchTerm,
    hasActiveFilters,
    clearAllFilters,
    availableSchoolYears,
    latestScreeningByStudent,
    consentSet,
    caseloadStats,
    paginatedStudents,
    totalStudents,
    totalPages,
    startIndex,
    effectiveItemsPerPage,
  } = useCaseloadTableData(students, schoolId)

  const {
    updatingStudentId,
    consentStudent,
    setConsentStudent,
    pauseConfirmStudent,
    setPauseConfirmStudent,
    pauseReason,
    setPauseReason,
    createEAForStudent,
    setCreateEAForStudent,
    eaToDelete,
    setEaToDelete,
    isDeletingEA,
    transferStudentTarget,
    setTransferStudentTarget,
    handleAssignEA,
    handleEACreated,
    handleConfirmDeleteEA,
    handleResultChange,
    handleProgramChange,
    handleConfirmPause,
  } = useCaseloadTableActions(latestScreeningByStudent, refetchSchoolDetails)

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-center'>
          <div className='w-8 h-8 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin' />
          <p className='text-sm text-gray-600'>Loading caseload...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <CaseloadStats
        stats={caseloadStats}
        activeFilter={programStatusFilter}
        onFilterChange={setProgramStatusFilter}
      />

      <div className='relative'>
        <Search className='absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2' />
        <Input
          placeholder='Search by student name...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='pl-10'
        />
      </div>

      <CaseloadFilters
        gradeFilter={gradeFilter}
        setGradeFilter={setGradeFilter}
        resultFilter={resultFilter}
        setResultFilter={setResultFilter}
        consentFilter={consentFilter}
        setConsentFilter={setConsentFilter}
        eaFilter={eaFilter}
        setEaFilter={setEaFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        programStatusFilter={programStatusFilter}
        speechEAs={speechEAs}
        availableSchoolYears={availableSchoolYears}
        onClearAll={clearAllFilters}
        onPageReset={() => setCurrentPage(1)}
      />

      <SortControls
        sortField={sortField}
        setSortField={setSortField}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        options={sortOptions}
      />

      <div className='flex justify-end mb-3'>
        <span className='inline-flex items-center px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full'>
          {totalStudents} student{totalStudents !== 1 ? 's' : ''} found
        </span>
      </div>

      <div className='overflow-hidden bg-white border border-gray-200 rounded-lg'>
        <ResponsiveTable className='w-full'>
          <TableHeader>
            <tr>
              <TableHead className='w-1/5 min-w-[180px]'>Student</TableHead>
              <TableHead className='w-[55px]'>Grade</TableHead>
              <TableHead className='w-[190px]'>Result</TableHead>
              <TableHead className='w-[70px]'>Program</TableHead>
              <TableHead className='w-[100px] text-center'>Therapy Consent</TableHead>
              <TableHead className='w-[150px]'>Speech EA</TableHead>
              <TableHead className='w-[60px]' />
            </tr>
          </TableHeader>

          <TableBody>
            {paginatedStudents.map(student => (
              <CaseloadTableRow
                key={student.id}
                student={student}
                gradesMap={gradesMap}
                speechEAs={speechEAs}
                screening={latestScreeningByStudent.get(student.id)}
                hasConsent={consentSet.has(student.id)}
                updatingStudentId={updatingStudentId}
                onResultChange={handleResultChange}
                onProgramChange={handleProgramChange}
                onAssignEA={handleAssignEA}
                onViewStudent={handleNavigate}
                setConsentStudent={setConsentStudent}
                setCreateEAForStudent={setCreateEAForStudent}
                setEaToDelete={setEaToDelete}
                setPauseConfirmStudent={setPauseConfirmStudent}
              />
            ))}
          </TableBody>
        </ResponsiveTable>

        {totalStudents === 0 && (
          <div className='py-8 text-center'>
            <p className='text-gray-500'>
              {searchTerm || hasActiveFilters
                ? 'No students found matching your filters.'
                : 'No students found in your caseload.'}
            </p>
          </div>
        )}
      </div>

      {totalStudents > 0 && (
        <CaseloadPagination
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          effectiveItemsPerPage={effectiveItemsPerPage}
          totalStudents={totalStudents}
        />
      )}

      <CaseloadDialogs
        schoolId={schoolId}
        consentStudent={consentStudent}
        setConsentStudent={setConsentStudent}
        createEAForStudent={createEAForStudent}
        setCreateEAForStudent={setCreateEAForStudent}
        onEACreated={handleEACreated}
        eaToDelete={eaToDelete}
        setEaToDelete={setEaToDelete}
        isDeletingEA={isDeletingEA}
        onConfirmDeleteEA={handleConfirmDeleteEA}
        transferStudentTarget={transferStudentTarget}
        setTransferStudentTarget={setTransferStudentTarget}
        pauseConfirmStudent={pauseConfirmStudent}
        setPauseConfirmStudent={setPauseConfirmStudent}
        pauseReason={pauseReason}
        setPauseReason={setPauseReason}
        onConfirmPause={handleConfirmPause}
      />
    </div>
  )
}

export default CaseloadTable
