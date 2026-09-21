import { useState } from 'react'
import { studentsApi } from '@/api/students'
import { useToast } from '@/hooks/use-toast'
import { ServiceStatus } from '@/types/database'

interface UsePauseStudentOptions<T> {
  getStudentId: (item: T) => string
  getStudentName: (item: T) => string
  onStatusChange: (item: T, newStatus: ServiceStatus) => void
}
