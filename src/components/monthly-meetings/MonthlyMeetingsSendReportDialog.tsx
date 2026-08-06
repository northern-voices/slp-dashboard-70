import { useState, useEffect } from 'react'
import { MonthlyMeeting } from '@/api/monthlymeetings'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { edgeFunctionsApi } from '@/api/edgeFunctions'
import { upsertEmailHistory } from '@/api/emailHistory'
import { Loader2, Mail } from 'lucide-react'
import MultiEmailInput from '@/components/reports/shared/MultiEmailInput'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useEmailSuggestions } from '@/hooks/useEmailSuggestions'
import ReportPasswordInput from '@/components/reports/shared/ReportPasswordInput'
import { useDefaultReportPassword } from '@/hooks/useDefaultReportPassword'

interface MonthlyMeetingsSendReportDialogProps {
  open: boolean
  meeting: MonthlyMeeting | null
  onClose: () => void
}

const MonthlyMeetingsSendReportDialog = ({
  open,
  meeting,
  onClose,
}: MonthlyMeetingsSendReportDialogProps) => {
  const [emails, setEmails] = useState<string[]>([])
  const [isSending, setIsSending] = useState(false)
  const [password, setPassword] = useState('')

  const { toast } = useToast()

  const { user } = useAuth()
  const defaultReportPassword = useDefaultReportPassword()
  const { currentSchool } = useOrganization()

  useEffect(() => {
    if (open && !password) {
      setPassword(defaultReportPassword)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultReportPassword])

  const emailHistory = useEmailSuggestions(user?.id, currentSchool?.id)

  const handleClose = () => {
    setEmails([])
    setPassword('')
    onClose()
  }

  const handleSend = async () => {
    if (!meeting || emails.length === 0) return

    setIsSending(true)
    try {
      await edgeFunctionsApi.monthlyMeetings(meeting.id, emails, password)

      if (user?.id) upsertEmailHistory(user.id, emails).catch(console.error)

      toast({
        title: 'Report Sent',
        description: `Monthly meeting report has been sent to ${emails.join(', ')}`,
      })
      handleClose()
    } catch (error) {
      console.error('Failed to send report:', error)
      toast({
        title: 'Error',
        description: 'Failed to send the report. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Monthly Meeting Report</DialogTitle>
          <DialogDescription>
            Send the monthly meeting report for "{meeting?.meeting_title}" via email.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <MultiEmailInput
            recipientEmails={emails}
            onChange={setEmails}
            emailHistory={emailHistory}
          />

          <ReportPasswordInput password={password} onChange={setPassword} />
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || emails.length === 0 || !password.trim()}>
            {isSending ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Sending...
              </>
            ) : (
              <>
                <Mail className='w-4 h-4 mr-2' />
                Send Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MonthlyMeetingsSendReportDialog
