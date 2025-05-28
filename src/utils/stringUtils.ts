
export const stringUtils = {
  /**
   * Capitalize the first letter of a string
   */
  capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Convert a string to title case
   */
  toTitleCase(str: string): string {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => this.capitalize(word))
      .join(' ');
  },

  /**
   * Generate initials from a full name
   */
  getInitials(firstName: string, lastName: string): string {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}`;
  },

  /**
   * Format a full name from first and last name
   */
  formatFullName(firstName: string, lastName: string): string {
    const first = firstName?.trim() || '';
    const last = lastName?.trim() || '';
    return `${first} ${last}`.trim();
  },

  /**
   * Truncate text to a specified length
   */
  truncate(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  },

  /**
   * Format phone number to (XXX) XXX-XXXX format
   */
  formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  },

  /**
   * Generate a slug from a string
   */
  slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  /**
   * Check if a string is empty or only whitespace
   */
  isEmpty(str: string): boolean {
    return !str || str.trim().length === 0;
  },
};
