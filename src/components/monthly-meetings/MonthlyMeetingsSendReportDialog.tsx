import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { edgeFunctionsApi } from '@/api/edgeFunctions'
import { Loader2, Mail } from 'lucide-react'

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
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const handleClose = () => {
    setEmail('')
    onClose()
  }

  const handleSend = async () => {
    if (!meeting || !email) return

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      })
      return
    }

    setIsSending(true)
    try {
      await edgeFunctionsApi.monthlyMeetings(meeting.id, email)
      toast({
        title: 'Report Sent',
        description: `Monthly meeting report has been sent to ${email}`,
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
          <div className='space-y-2'>
            <Label htmlFor='email'>Email Address</Label>
            <Input
              id='email'
              type='email'
              placeholder='Enter email address'
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isSending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending || !email}>
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
