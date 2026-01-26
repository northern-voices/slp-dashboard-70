import { ErrorPatterns } from '@/types/screening-form'

export interface PendingSpeechScreening {
  id: string
  formData: Record<string, unknown>
  apiPayload: {
    student_id: string
    screener_id: string
    grade_id: string
    error_patterns?: ErrorPatterns | null
    result?: string | null
    vocabulary_support?: boolean
    suspected_cas?: boolean
    clinical_notes?: string | null
    referral_notes?: string | null
  }
  studentId: string | undefined
  createdAt: string
}

const STORAGE_KEY = 'pending_speech_screenings'

export const offlineQueue = {
  getAll(): PendingSpeechScreening[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  add(
    formData: Record<string, unknown>,
    apiPayload: PendingSpeechScreening['apiPayload'],
    studentId: string | undefined,
  ): PendingSpeechScreening {
    const pending: PendingSpeechScreening = {
      id: crypto.randomUUID(),
      formData,
      apiPayload,
      studentId,
      createdAt: new Date().toISOString(),
    }

    const all = this.getAll()
    all.push(pending)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    return pending
  },

  remove(id: string): void {
    const all = this.getAll().filter(item => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  },

  count(): number {
    return this.getAll().length
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  },
}
