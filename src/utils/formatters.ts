/**
 * Formats a phone number to (XXX) XXX-XXXX format as the user types
 * @param value - The input value to format
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters
  const phoneNumber = value.replace(/\D/g, '')

  // Don't format if empty
  if (!phoneNumber) return ''

  // Format as user types: (XXX) XXX-XXXX
  if (phoneNumber.length <= 3) {
    return `(${phoneNumber}`
  } else if (phoneNumber.length <= 6) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
  } else {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }
}
