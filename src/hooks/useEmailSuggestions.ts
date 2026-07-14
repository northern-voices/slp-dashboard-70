import { useState, useEffect } from 'react'
import { getEmailHistory } from '@/api/emailHistory'
import { getSchoolStaffEmails } from '@/api/schoolStaff'

export const useEmailSuggestions = (userId?: string, schoolIds?: string | string[]) => {
  const [emails, setEmails] = useState<string[]>([])
  const ids = Array.isArray(schoolIds) ? schoolIds : schoolIds ? [schoolIds] : []
  const key = ids.join(',')

  useEffect(() => {
    if (!userId) return

    Promise.all([getEmailHistory(userId), getSchoolStaffEmails(ids)])
      .then(([history, staff]) => setEmails(Array.from(new Set([...history, ...staff]))))
      .catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, key])

  return emails
}
