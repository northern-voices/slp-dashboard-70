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

function getAcademicYearStartYear(date: Date): number {
  const year = date.getFullYear()
  const month = date.getMonth()
  return month < 7 ? year - 1 : year // August (7, 0-indexed) is the rollover month
}

// Short label for a date's academic year, e.g. "2025-26" - only meant to be shown
// when the date falls outside the CURRENT academic year (see isCurrentAcademicYear).
export function getAcademicYearShortLabel(dateString: string): string {
  const start = getAcademicYearStartYear(new Date(dateString))
  return `${start}-${String(start + 1).slice(2)}`
}

// True if the given date falls within the academic year currently in progress.
export function isCurrentAcademicYear(dateString: string): boolean {
  return getAcademicYearStartYear(new Date(dateString)) === getAcademicYearStartYear(new Date())
}
