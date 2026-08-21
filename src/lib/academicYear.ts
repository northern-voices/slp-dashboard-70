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
