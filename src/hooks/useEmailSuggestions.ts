import { useState, useEffect, useCallback } from 'react'
import { deleteEmailHistory, getEmailHistory } from '@/api/emailHistory'
import { getSchoolStaffEmails } from '@/api/schoolStaff'

export const useEmailSuggestions = (userId?: string, schoolIds?: string | string[]) => {
  const [historyEmails, setHistoryEmails] = useState<string[]>([])
  const [staffEmails, setStaffEmails] = useState<string[]>([])
  const ids = Array.isArray(schoolIds) ? schoolIds : schoolIds ? [schoolIds] : []
  const key = ids.join(',')

  useEffect(() => {
    if (!userId) return

    Promise.all([getEmailHistory(userId), getSchoolStaffEmails(ids)])
      .then(([history, staff]) => {
        setHistoryEmails(history)
        setStaffEmails(staff)
      })
      .catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, key])

  const emails = Array.from(new Set([...staffEmails, ...historyEmails]))
  const removableEmails = new Set(historyEmails.filter(email => !staffEmails.includes(email)))

  const removeEmail = useCallback(
    async (email: string) => {
      if (!userId) return
      await deleteEmailHistory(userId, email)
      setHistoryEmails(prev => prev.filter(e => e !== email))
    },
    [userId]
  )

  return { emails, removableEmails, removeEmail }
}
