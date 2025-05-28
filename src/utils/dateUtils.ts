
import { format, parseISO, isValid, differenceInYears } from 'date-fns';

export const dateUtils = {
  /**
   * Format a date string or Date object to a human-readable format
   */
  formatDate(date: string | Date, formatString: string = 'MMM dd, yyyy'): string {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) {
        return 'Invalid Date';
      }
      return format(dateObj, formatString);
    } catch {
      return 'Invalid Date';
    }
  },

  /**
   * Format a date for display in a more readable format
   */
  formatDisplayDate(date: string | Date): string {
    return this.formatDate(date, 'MMMM dd, yyyy');
  },

  /**
   * Format a date for form inputs (YYYY-MM-DD)
   */
  formatInputDate(date: string | Date): string {
    return this.formatDate(date, 'yyyy-MM-dd');
  },

  /**
   * Calculate age from date of birth
   */
  calculateAge(dateOfBirth: string | Date): number {
    try {
      const birthDate = typeof dateOfBirth === 'string' ? parseISO(dateOfBirth) : dateOfBirth;
      if (!isValid(birthDate)) {
        return 0;
      }
      return differenceInYears(new Date(), birthDate);
    } catch {
      return 0;
    }
  },

  /**
   * Check if a date is valid
   */
  isValidDate(date: string | Date): boolean {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return isValid(dateObj);
    } catch {
      return false;
    }
  },

  /**
   * Get current date in ISO format
   */
  getCurrentISODate(): string {
    return new Date().toISOString();
  },

  /**
   * Get current date in input format (YYYY-MM-DD)
   */
  getCurrentInputDate(): string {
    return this.formatInputDate(new Date());
  },
};
