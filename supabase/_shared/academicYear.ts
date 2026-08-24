// Academic year runs August 1 - July 31, e.g. "2025-2026" = Aug 1, 2025 - Jul 31, 2026.
export function isWithinAcademicYear(dateString: string, academicYear: string): boolean {
  const date = new Date(dateString)
  const [startYear, endYear] = academicYear.split('-').map(Number)

  const academicYearStart = new Date(startYear, 7, 1) // August 1st of start year
  const academicYearEnd = new Date(endYear, 6, 31) // July 31st of end year

  return date >= academicYearStart && date <= academicYearEnd
}

export function getAcademicYearRange(academicYear: string): { start: Date; end: Date } {
  const [startYear, endYear] = academicYear.split('-').map(Number)

  return {
    start: new Date(startYear, 7, 1), // August 1st of start year
    end: new Date(endYear, 6, 31), // July 31st of end year
  }
}
