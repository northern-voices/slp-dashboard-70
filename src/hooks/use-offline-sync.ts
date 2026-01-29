import { useEffect, useCallback, useState } from 'react'
import { useOnlineStatus } from './use-online-status'
import { offlineQueue } from '@/services/offline-queue'
import { speechScreeningsApi } from '@/api/speechscreenings'
import { schoolGradesApi } from '@/api/schoolGrades'
import { useToast } from './use-toast'

export function useOfflineSync() {
  const [pendingCount, setPendingCount] = useState(offlineQueue.count())

  const isOnline = useOnlineStatus()
  const { toast } = useToast()

  const syncPendingSubmissions = useCallback(async () => {
    const pending = offlineQueue.getAll()
    if (pending.length === 0) return

    toast({
      title: 'Syncing...',
      description: `Submitting ${pending.length} pending screenings(s)`,
    })

    let successCount = 0
    let failCount = 0

    for (const item of pending) {
      try {
        let gradeId = item.apiPayload.grade_id

        // If no grade_id but we have gradeInfo, check/create the grade first
        if (!gradeId && item.gradeInfo) {
          const { school_id, grade_level, academic_year } = item.gradeInfo

          const gradeAvailability = await schoolGradesApi.checkGradeAvailability(
            school_id,
            grade_level,
            academic_year,
          )

          if (gradeAvailability.exists && gradeAvailability.grade?.id) {
            gradeId = gradeAvailability.grade.id
          } else {
            // Create the grade
            const newGrade = await schoolGradesApi.createSchoolGrade({
              school_id,
              grade_level,
              academic_year,
            })
            gradeId = newGrade.id
          }
        }

        if (!gradeId) {
          console.error('Could not resolve grade_id for screening:', item.id)
          failCount++
          continue
        }

        // Submit with resolved grade_id
        await speechScreeningsApi.createSpeechScreening({ ...item.apiPayload, grade_id: gradeId })
        offlineQueue.remove(item.id)
        successCount++
      } catch (error) {
        console.error('Failed to sync screening:', item.id, error)
        failCount++
        // Keep in queue to retry later
      }
    }

    setPendingCount(offlineQueue.count())

    if (successCount > 0 && failCount === 0) {
      toast({
        title: 'Sync complete',
        description: `${successCount} screenings(s) submitted successfully.`,
      })
    } else if (successCount > 0 && failCount > 0) {
      toast({
        title: 'Partial sync',
        description: `${successCount} submitted, ${failCount} failed. Will retry later.`,
      })
    } else if (failCount > 0) {
      toast({
        title: 'Sync failed',
        description: `Could not submit ${failCount} screening(s). Will retry when connection improves.`,
        variant: 'destructive',
      })
    }
  }, [toast])

  // Sync when coming back online
  useEffect(() => {
    if (isOnline) {
      syncPendingSubmissions()
    }
  }, [isOnline, syncPendingSubmissions])

  // Update pending count when it changes
  useEffect(() => {
    setPendingCount(offlineQueue.count())
  }, [])

  return { isOnline, syncPendingSubmissions, pendingCount }
}
