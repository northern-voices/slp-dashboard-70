import { useEffect } from 'react'

export const useWarnBeforeUnload = (shouldWarn: boolean) => {
  useEffect(() => {
    if (!shouldWarn) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [shouldWarn])
}
