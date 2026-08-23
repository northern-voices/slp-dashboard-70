const ACADEMIC_YEAR_ROLLOVER_MONTH = 7 // August (0-indexed) - academic year runs Aug 1 - Jul 31

// The start year of the academic year currently in progress, e.g. 2025 for Aug 2025 - Jul 2026.
export const getCurrentAcademicYearStart = (referenceDate: Date = new Date()): number => {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  return month < ACADEMIC_YEAR_ROLLOVER_MONTH ? year - 1 : year
}

export const getCurrentAcademicYear = (referenceDate: Date = new Date()): string => {
  const start = getCurrentAcademicYearStart(referenceDate)
  return `${start}-${start + 1}`
}

// Previous and current academic year, for report-generation dropdowns.
export const getAcademicYearOptions = (referenceDate: Date = new Date()): string[] => {
  const start = getCurrentAcademicYearStart(referenceDate)
  return [`${start - 1}-${start}`, `${start}-${start + 1}`]
}

// N most recent academic years, most recent first, e.g. getRecentAcademicYears(3) -> ['2025-2026', '2024-2025', '2023-2024']
export const getRecentAcademicYears = (
  count: number = 5,
  referenceDate: Date = new Date()
): string[] => {
  const start = getCurrentAcademicYearStart(referenceDate)
  return Array.from({ length: count }, (_, i) => `${start - i}-${start - i + 1}`)
}

// Date the currently-in-progress academic year began, e.g. Aug 1 2025 for any date in Aug 2025 - Jul 2026.
export const getCurrentAcademicYearStartDate = (referenceDate: Date = new Date()): Date =>
  new Date(getCurrentAcademicYearStart(referenceDate), ACADEMIC_YEAR_ROLLOVER_MONTH, 1)

// Parses "2024-2025" into its Aug 1, 2024 - Jul 31, 2025 (end of day) date range.
export const getAcademicYearRange = (academicYear: string): { start: Date; end: Date } => {
  const startYear = parseInt(academicYear.split('-')[0], 10)
  return {
    start: new Date(startYear, ACADEMIC_YEAR_ROLLOVER_MONTH, 1),
    end: new Date(startYear + 1, ACADEMIC_YEAR_ROLLOVER_MONTH, 0, 23, 59, 59, 999),
  }
}

// Same range as YYYY-MM-DD strings, for Postgres date-column queries (.gte/.lte).
export const getAcademicYearRangeStrings = (
  academicYear: string
): { start: string; end: string } => {
  const startYear = parseInt(academicYear.split('-')[0], 10)
  return {
    start: `${startYear}-08-01`,
    end: `${startYear + 1}-07-31`,
  }
}

// Compact label, e.g. "2024-25", for space-constrained UI.
export const getAcademicYearShortLabel = (dateStr: string): string => {
  const start = getCurrentAcademicYearStart(new Date(dateStr))
  return `${start}-${String(start + 1).slice(2)}`
}

// True if the given date falls within the academic year currently in progress.
export const isCurrentAcademicYear = (dateStr: string): boolean =>
  getCurrentAcademicYearStart(new Date(dateStr)) === getCurrentAcademicYearStart()
