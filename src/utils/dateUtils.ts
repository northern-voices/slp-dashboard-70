import {
  format,
  parseISO,
  isValid,
  differenceInYears,
  differenceInMonths,
  isBefore,
} from 'date-fns'

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

  /**
   * Age on a given date in years and months, e.g. "11 years; 10 months".
   * Both dates are 'YYYY-MM-DD'. Returns null if either is missing or invalid,
   * or if onDate is before the date of birth.
   */
  formatAgeAt(
    dateOfBirth: string | null | undefined,
    onDate: string | null | undefined
  ): string | null {
    if (!dateOfBirth || !onDate) return null

    const birth = parseDateSafely(dateOfBirth)
    const on = parseDateSafely(onDate)
    if (!isValid(birth) || !isValid(on) || isBefore(on, birth)) return null

    const totalMonths = differenceInMonths(on, birth)
    const years = Math.floor(totalMonths / 12)
    const months = totalMonths % 12

    const yearText = `${years} ${years === 1 ? 'year' : 'years'}`
    const monthText = `${months} ${months === 1 ? 'month' : 'months'}`
    return `${yearText}; ${monthText}`
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
