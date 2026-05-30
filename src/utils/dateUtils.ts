import { format, parseISO, isValid, differenceInYears } from 'date-fns'

export const dateUtils = {
  /**
   * Format a date string or Date object to a human-readable format
   */
  formatDate(date: string | Date, formatString: string = 'MMM dd, yyyy'): string {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date
      if (!isValid(dateObj)) {
        return 'Invalid Date'
      }
      return format(dateObj, formatString)
    } catch {
      return 'Invalid Date'
    }
  },

  /**
   * Format a date for display in a more readable format
   */
  formatDisplayDate(date: string | Date): string {
    return this.formatDate(date, 'MMMM dd, yyyy')
  },

  /**
   * Format a date for form inputs (YYYY-MM-DD)
   */
  formatInputDate(date: string | Date): string {
    return this.formatDate(date, 'yyyy-MM-dd')
  },

  /**
   * Calculate age from date of birth
   */
  calculateAge(dateOfBirth: string | Date): number {
    try {
      const birthDate = typeof dateOfBirth === 'string' ? parseISO(dateOfBirth) : dateOfBirth
      if (!isValid(birthDate)) {
        return 0
      }
      return differenceInYears(new Date(), birthDate)
    } catch {
      return 0
    }
  },

  /**
   * Check if a date is valid
   */
  isValidDate(date: string | Date): boolean {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date
      return isValid(dateObj)
    } catch {
      return false
    }
  },

  /**
   * Get current date in ISO format
   */
  getCurrentISODate(): string {
    return new Date().toISOString()
  },

  /**
   * Get current date in input format (YYYY-MM-DD)
   */
  getCurrentInputDate(): string {
    return this.formatInputDate(new Date())
  },
}

/**
 * Safely parses a date string without timezone issues
 * This prevents the date from shifting by one day due to timezone conversion
 */
export const parseDateSafely = (dateString: string): Date => {
  // If the date string is in YYYY-MM-DD format, parse it as local date
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day) // month is 0-indexed in Date constructor
  }

  // For other formats, use the standard Date constructor
  return new Date(dateString)
}

// 0-indexed: 7 = August start of school year, 8 = September start of school year
const SCHOOL_YEAR_START_MONTH = 7

export const getSchoolYear = (date: Date = new Date()): string => {
  const month = date.getMonth()
  const year = date.getFullYear()

  return month >= SCHOOL_YEAR_START_MONTH ? `${year}-${year + 1}` : `${year - 1}-${year}`
}

export const getSchoolYearRange = (schoolYear: string): { start: string; end: string } => {
  const startYear = parseInt(schoolYear.split('-')[0])
  const startMonth = SCHOOL_YEAR_START_MONTH === 7 ? '08-01' : '09-01'
  const endMonth = SCHOOL_YEAR_START_MONTH === 7 ? '07-31' : '08-31'

  return {
    start: `${startYear}-${startMonth}`,
    end: `${startYear + 1}-${endMonth}`,
  }
}

export const getRecentSchoolYears = (count: number = 5): string[] => {
  const current = getSchoolYear()
  const startYear = parseInt(current.split('-')[0])

  return Array.from({ length: count }, (_, i) => {
    const y = startYear - i
    return `${y}-${y + 1}`
  })
}
