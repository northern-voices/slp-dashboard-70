import { useCallback, useEffect, useRef, useState } from 'react'
import type { StudentData } from '@/api/monthlymeetings'
import type {
  MonthlyMeetingDraftFormData,
  MonthlyMeetingDraftType,
} from '@/types/monthly-meeting-draft'
import {
  useCreateMonthlyMeetingDraft,
  useUpdateMonthlyMeetingDraft,
} from './use-monthly-meeting-drafts'

const DEBOUNCE_MS = 600

interface UseDraftAutosaveParams {
  schoolId: string | undefined
  meetingId: string | null
  draftType: MonthlyMeetingDraftType
}
