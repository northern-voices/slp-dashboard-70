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

export const useMonthlyMeetingDraftAutosave = ({
  schoolId,
  meetingId,
  draftType,
}: UseDraftAutosaveParams) => {
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null)
  const [isLabelCustom, setIsLabelCustom] = useState(false)

  const activeDraftIdRef = useRef(activeDraftId)
  activeDraftIdRef.current = activeDraftId

  const isLabelCustomRef = useRef(isLabelCustom)
  isLabelCustomRef.current = isLabelCustom

  const isCreatingRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const createDraft = useCreateMonthlyMeetingDraft()
  const updateDraft = useUpdateMonthlyMeetingDraft()

  const scheduleSave = useCallback(
    (formData: MonthlyMeetingDraftFormData, studentData: StudentData) => {
      if (!schoolId) return
      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      timeoutRef.current = setTimeout(() => {
        console.log(
          'saving, activeDraftId =',
          activeDraftIdRef.current,
          'isCreating =',
          isCreatingRef.current
        )

        if (activeDraftIdRef.current) {
          updateDraft.mutate({
            id: activeDraftIdRef.current,
            formData,
            studentData,
            isLabelCustom: isLabelCustomRef.current,
          })
          return
        }

        if (isCreatingRef.current) return
        isCreatingRef.current = true

        createDraft.mutate(
          { schoolId, meetingId, draftType, formData, studentData },
          {
            onSuccess: draft => setActiveDraftId(draft.id),
            onSettled: () => {
              isCreatingRef.current = false
            },
          }
        )
      }, DEBOUNCE_MS)
    },
    [schoolId, meetingId, draftType, createDraft, updateDraft]
  )

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    },
    []
  )

  return { activeDraftId, setActiveDraftId, isLabelCustom, setIsLabelCustom, scheduleSave }
}
