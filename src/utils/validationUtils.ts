
export const validationUtils = {
  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number (US format)
   */
  isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
  },

  /**
   * Validate required field
   */
  isRequired(value: string | number | boolean | null | undefined): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return !isNaN(value);
    return Boolean(value);
  },

  /**
   * Validate minimum length
   */
  hasMinLength(value: string, minLength: number): boolean {
    return value && value.length >= minLength;
  },

  /**
   * Validate maximum length
   */
  hasMaxLength(value: string, maxLength: number): boolean {
    return !value || value.length <= maxLength;
  },

  /**
   * Validate date range (date is between min and max)
   */
  isDateInRange(date: string, minDate?: string, maxDate?: string): boolean {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return false;

    if (minDate) {
      const minDateObj = new Date(minDate);
      if (dateObj < minDateObj) return false;
    }

    if (maxDate) {
      const maxDateObj = new Date(maxDate);
      if (dateObj > maxDateObj) return false;
    }

    return true;
  },

  /**
   * Validate student ID format (alphanumeric, 3-10 characters)
   */
  isValidStudentId(studentId: string): boolean {
    const studentIdRegex = /^[a-zA-Z0-9]{3,10}$/;
    return studentIdRegex.test(studentId);
  },

  /**
   * Create a validation result object
   */
  createValidationResult(isValid: boolean, message?: string) {
    return {
      isValid,
      message: isValid ? undefined : message,
    };
  },
};
