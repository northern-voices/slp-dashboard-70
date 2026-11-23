import { isWithinAcademicYear } from './academicYear.ts'

export type CaseloadScope = 'school_year' | 'full_caseload'

interface BuildSchoolSummaryArgs {
  supabaseUrl: string
  supabaseKey: string
  schoolId: string
  schoolName: string
  academicYear: string
  caseloadScope: CaseloadScope
  // Needs: id, first_name, last_name, program_status, current_grade_id
  students: any[]
  // Every speech screening for these students (all years), selected with students(*),school_grades(*)
  allScreenings: any[]
  // Latest screening per student, already filtered to academicYear
  latestScreenings: any[]
}

// error_patterns can arrive as a JSON string or an object - handle both
function getScreeningMetadata(screening: any): Record<string, unknown> {
  let patterns = screening.error_patterns
  if (!patterns) return {}

  if (typeof patterns === 'string') {
    try {
      patterns = JSON.parse(patterns)
    } catch (e) {
      console.error('Failed to parse error_patterns JSON:', e)
      return {}
    }
  }

  return patterns?.screening_metadata ?? {}
}

const isFlagSet = (value: unknown) => value === true || value === 'true'

export async function buildSchoolSummaryDocument({
  supabaseUrl,
  supabaseKey,
  schoolId,
  schoolName,
  academicYear,
  caseloadScope,
  students,
  allScreenings,
  latestScreenings,
}: BuildSchoolSummaryArgs) {
  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
  }

  // Grade lookup for raw student records (full_caseload) that have no screening attached
  const gradesResponse = await fetch(
    `${supabaseUrl}/rest/v1/school_grades?school_id=eq.${schoolId}&select=id,grade_level`,
    { headers }
  )
  if (!gradesResponse.ok) {
    throw new Error(`Failed to fetch school grades: ${gradesResponse.status}`)
  }
  const schoolGrades: { id: string; grade_level: string }[] = await gradesResponse.json()
  const gradeLevelById = new Map(schoolGrades.map(g => [g.id, g.grade_level] as const))

  const transformRecord = (screening: any) => ({
    name: `${screening.students.first_name} ${screening.students.last_name}`,
    grade: screening.school_grades?.grade_level || '',
    result: screening.result || '',
    date: new Date(screening.created_at).toISOString().split('T')[0],
    recommendations_and_referrals: screening.referral_notes || '',
  })

  const toSummaryStudent = (student: any) => ({
    name: `${student.first_name} ${student.last_name}`,
    grade: gradeLevelById.get(student.current_grade_id) || '',
  })

  let qualifiedStudents: any[]
  let subStudents: any[]

  if (caseloadScope === 'full_caseload') {
    // Latest screening per student across ALL years, so a later "No Consent" attempt
    // overrides a stale qualified/sub program_status
    const latestScreeningByStudentId = new Map<string, any>()
    allScreenings.forEach(screening => {
      const existing = latestScreeningByStudentId.get(screening.student_id)
      if (!existing || new Date(screening.created_at) > new Date(existing.created_at)) {
        latestScreeningByStudentId.set(screening.student_id, screening)
      }
    })
    const hasNoConsent = (student: any) =>
      latestScreeningByStudentId.get(student.id)?.result === 'non_registered_no_consent'

    qualifiedStudents = students.filter(s => s.program_status === 'qualified' && !hasNoConsent(s))
    subStudents = students.filter(s => s.program_status === 'sub' && !hasNoConsent(s))
  } else {
    const isQualified = (s: any) => isFlagSet(getScreeningMetadata(s).qualifies_for_speech_program)
    const isSub = (s: any) => isFlagSet(getScreeningMetadata(s).sub)

    qualifiedStudents = latestScreenings.filter(s => isQualified(s) && !isSub(s))
    subStudents = latestScreenings.filter(isSub)
  }

  const priorityRescreenStudents = latestScreenings.filter(
    s => s.students?.needs_priority_rescreen === true
  )
  const studentsRecommendationsAndReferrals = latestScreenings.filter(
    s => (s.referral_notes || '').trim() !== ''
  )
  // Returning-absent compares against "now", so only include it for the year in progress
  let returningAbsentStudents: { name: string; grade: string }[] = []
  if (isWithinAcademicYear(new Date().toISOString(), academicYear)) {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_returning_absent_students`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ p_school_id: schoolId }),
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch returning absent students: ${response.status}`)
    }

    const rows = await response.json()
    const studentById = new Map(students.map(s => [s.id, s] as const))
    returningAbsentStudents = rows.map((row: any) => {
      const student = studentById.get(row.student_id)
      return {
        name: `${row.first_name} ${row.last_name}`,
        grade: student ? gradeLevelById.get(student.current_grade_id) || '' : '',
      }
    })
  }

  const templateName =
    studentsRecommendationsAndReferrals.length > 0
      ? 'Schools Summary Report With Referrals'
      : 'Schools Summary Report No Referrals'

  // Explicit type: the two transforms return different shapes, and .map() can't infer
  // one return type from a union of functions
  const transformSectionA: (row: any) => Record<string, unknown> =
    caseloadScope === 'full_caseload' ? toSummaryStudent : transformRecord

  const document = {
    metadata: { file_name: `${schoolName}-Summary` },
    template: { name: templateName, version: 1 },
    context: {
      screening_date: academicYear,
      slp: 'Lisa Brillinger',
      qualified: qualifiedStudents.length > 0,
      qualified_students: qualifiedStudents.map(transformSectionA),
      sub: subStudents.length > 0,
      sub_students: subStudents.map(transformSectionA),
      priority_rescreen: priorityRescreenStudents.length > 0,
      students_priority_rescreen: priorityRescreenStudents.map(transformRecord),
      students_recommendations_and_referrals:
        studentsRecommendationsAndReferrals.map(transformRecord),
      returning_absent: returningAbsentStudents.length > 0,
      returning_absent_students: returningAbsentStudents,
    },
  }

  return {
    document,
    templateName,
    qualifiedCount: qualifiedStudents.length,
    subCount: subStudents.length,
    recommendationsCount: studentsRecommendationsAndReferrals.length,
  }
}
