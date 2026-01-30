import { useOfflineSync } from '@/hooks/use-offline-sync'
import { OfflineIndicator } from '@/components/common/OfflineIndicator'

interface OfflineSyncProviderProps {
  children: React.ReactNode
}

export function OfflineSyncProvider({ children }: OfflineSyncProviderProps) {
  // Runs the sync logic app-wide
  useOfflineSync()

  return (
    <>
      {children}
      <OfflineIndicator />
    </>
  )
}
