import { useOnlineStatus } from '@/hooks/use-online-status'
import { offlineQueue } from '@/services/offline-queue'
import { WifiOff, Clock } from 'lucide-react'

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()
  const pendingCount = offlineQueue.count()

  // Show if offline OR if there are pending submissions
  if (isOnline && pendingCount === 0) return null

  return (
    <div className='fixed bottom-4 right-4 z-50 flex flex-col gap-2'>
      {!isOnline && (
        <div className='bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg'>
          <WifiOff className='w-4 h-4' />
          <span className='text-sm font-medium'>
            You're offline - changes will sync when reconnected
          </span>
        </div>
      )}
      {pendingCount > 0 && (
        <div className='bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg'>
          <Clock className='w-4 h-4' />
          <span className='text-sm font-medium'>
            {pendingCount} screening{pendingCount > 1 ? 's' : ''} pending sync
          </span>
        </div>
      )}
    </div>
  )
}
