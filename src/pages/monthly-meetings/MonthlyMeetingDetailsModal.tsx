import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, User, FileText, X, Users, Edit2, Save, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { MonthlyMeeting } from '@/api/monthlymeetings'

interface MonthlyMeetingDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  meeting: MonthlyMeeting | null
}

const MonthlyMeetingDetailsModal = ({
  isOpen,
  onClose,
  meeting,
}: MonthlyMeetingDetailsModalProps) => {
  const [isEditNotes, setIsEditingNotes] = useState(false)
  const [notesText, setNotesText] = useState('')
  const navigate = useNavigate()
  const { currentSchool } = useOrganization()

  if (!meeting) return null

  const handleEditMeeting = () => {
    if (currentSchool?.id) {
      navigate(`/school/${currentSchool.id}/edit-monthly-meeting/${meeting.id}`)
    } else {
      navigate(`/edit-monthly-meeting/${meeting.id}`)
    }
    onClose()
  }
}
