import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useSpeechScreeningsByStudent } from '@/hooks/screenings'
import { useMonthlyMeetingsByStudent } from '@/hooks/monthly-meetings/use-monthly-meetings-queries'
import ScreeningDetailsModal from '@/components/students/screening-history/ScreeningDetailsModal'
import LastScreeningCard from '@/components/monthly-meetings/LastScreeningCard'
import LastMeetingCard from '@/components/monthly-meetings/LastMeetingCard'
import MonthlyMeetingDetailsModal from '@/pages/monthly-meetings/MonthlyMeetingDetailsModal'
import { GRADE_MAPPING } from '@/constants/app'
import { Student } from '@/types/database'

type StudentData = Record<string, { sessions_attended: number | null; meeting_notes: string }>

interface StudentDetailsModalProps {
  open: boolean
  onClose: () => void
  selectedStudent: Student | null
  studentData: StudentData
  setStudentData: (updater: StudentData | ((prev: StudentData) => StudentData)) => void
  meetingId?: string
}

const StudentDetailsModal = ({
  open,
  onClose,
  selectedStudent,
  studentData,
  setStudentData,
  meetingId,
}: StudentDetailsModalProps) => {
  const [showScreeningModal, setShowScreeningModal] = useState(false)
  const [showMeetingModal, setShowMeetingModal] = useState(false)

  const { toast } = useToast()

  const { data: studentScreenings = [], isLoading: isLoadingScreenings } =
    useSpeechScreeningsByStudent(selectedStudent?.id)

  const mostRecentScreening = studentScreenings[0]

  const { data: studentMeetings = [], isLoading: isLoadingMeetings } = useMonthlyMeetingsByStudent(
    selectedStudent?.id
  )

  const mostRecentMeeting = studentMeetings.find(m => m.id !== meetingId)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            Student Details:{' '}
            {selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : ''}
          </DialogTitle>
          {selectedStudent?.grade && (
            <p className='text-sm text-gray-500'>
              Grade: {GRADE_MAPPING[selectedStudent.grade]?.display || selectedStudent.grade}
            </p>
          )}
          <div className='grid grid-cols-2 gap-3 mt-3'>
            {isLoadingScreenings ? (
              <div className='flex flex-col h-full p-4 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-pulse'>
                <div className='flex items-center gap-2 mb-3'>
                  <div className='w-6 h-6 rounded-full bg-gray-200' />
                  <div className='w-24 h-3 bg-gray-200 rounded' />
                </div>
                <div className='mb-3'>
                  <div className='w-20 h-5 bg-gray-200 rounded-full' />
                </div>
                <div className='mt-auto'>
                  <div className='w-full h-8 bg-gray-100 rounded-md' />
                </div>
              </div>
            ) : mostRecentScreening ? (
              <LastScreeningCard
                screening={mostRecentScreening}
                onViewDetails={() => setShowScreeningModal(true)}
              />
            ) : (
              <div className='p-4 border border-gray-200 border-dashed bg-gray-50/50 rounded-xl'>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-gray-300 rounded-full' />
                  <span className='text-sm text-gray-400'>No speech screenings on record</span>
                </div>
              </div>
            )}

            {isLoadingMeetings ? (
              <div className='flex flex-col h-full p-4 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-pulse'>
                <div className='flex items-center gap-2 mb-3'>
                  <div className='w-6 h-6 rounded-full bg-gray-200' />
                  <div className='w-24 h-3 bg-gray-200 rounded' />
                </div>
                <div className='space-y-2 mb-3'>
                  <div className='w-28 h-5 bg-gray-200 rounded-full' />
                  <div className='flex items-center gap-1.5'>
                    <div className='w-3 h-3 bg-gray-200 rounded' />
                    <div className='w-20 h-3 bg-gray-200 rounded' />
                  </div>
                </div>
                <div className='mt-auto'>
                  <div className='w-full h-8 bg-gray-100 rounded-md' />
                </div>
              </div>
            ) : mostRecentMeeting ? (
              <LastMeetingCard
                meeting={mostRecentMeeting}
                onViewDetails={() => setShowMeetingModal(true)}
              />
            ) : (
              <div className='p-4 border border-gray-200 border-dashed bg-gray-50/50 rounded-xl'>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-gray-300 rounded-full' />
                  <span className='text-sm text-gray-400'>No monthly meetings on record</span>
                </div>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className='py-4 space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='modal_sessions_attended'>Sessions Attended</Label>
            <Input
              id='modal_sessions_attended'
              type='number'
              min='0'
              value={
                selectedStudent?.id
                  ? (studentData[selectedStudent.id]?.sessions_attended ?? '')
                  : ''
              }
              onChange={e => {
                if (selectedStudent?.id) {
                  const value = e.target.value === '' ? null : parseInt(e.target.value)
                  setStudentData(prev => ({
                    ...prev,
                    [selectedStudent.id]: {
                      ...prev[selectedStudent.id],
                      sessions_attended: value,
                      meeting_notes: prev[selectedStudent.id]?.meeting_notes || '',
                    },
                  }))
                }
              }}
              placeholder='Enter number of sessions attended'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='modal_meeting_notes'>Meeting Notes</Label>
            <Textarea
              id='modal_meeting_notes'
              value={
                selectedStudent?.id ? studentData[selectedStudent.id]?.meeting_notes || '' : ''
              }
              onChange={e => {
                if (selectedStudent?.id) {
                  setStudentData(prev => ({
                    ...prev,
                    [selectedStudent.id]: {
                      ...prev[selectedStudent.id],
                      sessions_attended: prev[selectedStudent.id]?.sessions_attended ?? null,
                      meeting_notes: e.target.value,
                    },
                  }))
                }
              }}
              placeholder='Meeting notes for this student...'
              rows={6}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={onClose}>
            Close
          </Button>
          <Button
            type='button'
            onClick={() => {
              onClose()
              toast({
                title: 'Student Data Saved',
                description: `Data for ${selectedStudent?.first_name} ${selectedStudent?.last_name} has been saved.`,
              })
            }}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>

      {mostRecentScreening && (
        <ScreeningDetailsModal
          isOpen={showScreeningModal}
          onClose={() => setShowScreeningModal(false)}
          screening={mostRecentScreening}
        />
      )}

      {mostRecentMeeting && (
        <MonthlyMeetingDetailsModal
          isOpen={showMeetingModal}
          onClose={() => setShowMeetingModal(false)}
          meeting={mostRecentMeeting}
        />
      )}
    </Dialog>
  )
}

export default StudentDetailsModal
