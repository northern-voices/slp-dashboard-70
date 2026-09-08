import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import MultiEmailInput from '@/components/reports/shared/MultiEmailInput'
import ReportPasswordInput from '@/components/reports/shared/ReportPasswordInput'
import { edgeFunctionsApi } from '@/api/edgeFunctions'
import { useToast } from '@/hooks/use-toast'

interface CaseloadRow {
  name: string
  grade: string
  result: string
  consent: string
  speech_ea: string
}

interface EmailCaseloadReportModalProps {
  isOpen: boolean
  onClose: () => void
  schoolId: string
  academicYear: string
  qualifiedStudents: CaseloadRow[]
  subStudents: CaseloadRow[]
}

const EmailCaseloadReportModal = ({
  isOpen,
  onClose,
  schoolId,
  academicYear,
  qualifiedStudents,
  subStudents,
}: EmailCaseloadReportModalProps) => {
  const [recipientEmails, setRecipientEmails] = useState<string[]>([])
  const [password, setPassword] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const handleSend = async () => {
    if (recipientEmails.length === 0 || !password) return

    setIsSending(true)

    try {
      await edgeFunctionsApi.programCaseloadReport(
        schoolId,
        academicYear,
        qualifiedStudents,
        subStudents,
        recipientEmails,
        password
      )
      toast({
        title: 'Report Sent',
        description: `Caseload report sent to ${recipientEmails.join(', ')}`,
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
          <DialogTitle>Email Caseload Report</DialogTitle>
        </DialogHeader>

        <p className='text-sm text-gray-600'>
          Sends the currently filtered caseload ({qualifiedStudents.length} qualified,{' '}
          {subStudents.length} sub) as a password-protected report link.
        </p>

        <MultiEmailInput
          recipientEmails={recipientEmails}
          onChange={setRecipientEmails}
          emailHistory={[]}
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
      </DialogContent>
    </Dialog>
  )
}

export default EmailCaseloadReportModal
