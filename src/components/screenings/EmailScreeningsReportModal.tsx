import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import MultiEmailInput from '@/components/reports/shared/MultiEmailInput'
import ReportPasswordInput from '@/components/reports/shared/ReportPasswordInput'
import { edgeFunctionsApi } from '@/api/edgeFunctions'
import { upsertEmailHistory } from '@/api/emailHistory'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { useEmailSuggestions } from '@/hooks/useEmailSuggestions'
import { useDefaultReportPassword } from '@/hooks/useDefaultReportPassword'
import { ServiceStatus, ProgramStatus } from '@/types/database'

interface ScreeningReportRow {
  name: string
  grade: string
  result: string
  program_status: ProgramStatus
  service_status?: ServiceStatus
  date: string
  screener: string
}

interface EmailScreeningsReportModalProps {
  isOpen: boolean
  onClose: () => void
  schoolId: string
  academicYear: string
  screenings: ScreeningReportRow[]
}

const EmailScreeningsReportModal = ({
  isOpen,
  onClose,
  schoolId,
  academicYear,
  screenings,
}: EmailScreeningsReportModalProps) => {
  const [recipientEmails, setRecipientEmails] = useState<string[]>([])
  const [password, setPassword] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const { user } = useAuth()
  const defaultReportPassword = useDefaultReportPassword()
  const emailHistory = useEmailSuggestions(user?.id, schoolId)

  useEffect(() => {
    if (isOpen && !password) {
      setPassword(defaultReportPassword)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultReportPassword])

  const handleSend = async () => {
    if (recipientEmails.length === 0 || !password) return

    setIsSending(true)

    try {
      await edgeFunctionsApi.screeningsTableReport(
        schoolId,
        academicYear,
        screenings,
        recipientEmails,
        password
      )

      if (user?.id) upsertEmailHistory(user.id, recipientEmails).catch(console.error)

      toast({
        title: 'Report Sent',
        description: `Speech screenings report sent to ${recipientEmails.join(', ')}`,
      })

      onClose()
      setRecipientEmails([])
      setPassword('')
    } catch (error) {
      toast({
        title: 'Failed to Send Report',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Email Speech Screenings Report</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <p className='text-sm text-gray-600'>
            Sends the currently filtered screenings ({screenings.length} screening
            {screenings.length !== 1 ? 's' : ''}) as a password-protected report link.
          </p>

          <MultiEmailInput
            recipientEmails={recipientEmails}
            onChange={setRecipientEmails}
            emailHistory={emailHistory}
          />

          <ReportPasswordInput password={password} onChange={setPassword} />

          <div className='flex justify-end gap-3 pt-2'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending || recipientEmails.length === 0 || !password}>
              {isSending ? 'Sending...' : 'Send Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
export default EmailScreeningsReportModal
