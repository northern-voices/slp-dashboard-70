import { useEffect, useCallback, useState } from 'react'
import { useOnlineStatus } from './use-online-status'
import { offlineQueue } from '@/services/offline-queue'
import { speechScreeningsApi } from '@/api/speechscreenings'
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
        await speechScreeningsApi.createSpeechScreening(item.apiPayload)
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
