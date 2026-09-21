import { useState } from 'react'
import { studentsApi } from '@/api/students'
import { useToast } from '@/hooks/use-toast'
import { ServiceStatus } from '@/types/database'

interface UsePauseStudentOptions<T> {
  getStudentId: (item: T) => string
  getStudentName: (item: T) => string
  onStatusChange: (item: T, newStatus: ServiceStatus) => void
}

export const usePauseStudent = <T>({
  getStudentId,
  getStudentName,
  onStatusChange,
}: UsePauseStudentOptions<T>) => {
  const [pauseTarget, setPauseTarget] = useState<T | null>(null)
  const [pauseReason, setPauseReason] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const requestPause = (item: T) => setPauseTarget(item)

  const resumeItem = (item: T) => onStatusChange(item, 'none')

  const cancelPause = () => {
    setPauseTarget(null)
    setPauseReason('')
  }

  const confirmPause = async () => {
    if (!pauseTarget) return
    onStatusChange(pauseTarget, 'paused')

    if (pauseReason.trim()) {
      setIsSaving(true)

      try {
        await studentsApi.createStudentNote(
          getStudentId(pauseTarget),
          `Pause / Away: ${pauseReason.trim()}`
        )
      } catch {
        toast({
          title: 'Error',
          description: 'Status updated, but the note failed to save.',
          variant: 'destructive',
        })
      } finally {
        setIsSaving(false)
      }
    }

    cancelPause()
  }

  return {
    pauseTarget,
    pauseStudentName: pauseTarget ? getStudentName(pauseTarget) : '',
    pauseReason,
    setPauseReason,
    isSaving,
    requestPause,
    resumeItem,
    confirmPause,
    cancelPause,
  }
}
