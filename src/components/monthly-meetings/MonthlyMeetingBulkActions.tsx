import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Mail, X, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { MonthlyMeeting } from '@/api/monthlymeetings'
import { useDeleteMonthlyMeeting } from '@/hooks/monthly-meetings/use-monthly-meetings-mutations'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { edgeFunctionsApi } from '@/api/edgeFunctions'

interface MonthlyMeetingBulkActionsProps {
  selectedCount: number
  selectedMeetings: MonthlyMeeting[]
  onClearSelection: () => void
}

const MonthlyMeetingBulkActions = ({
  selectedCount,
  selectedMeetings,
  onClearSelection,
}: MonthlyMeetingBulkActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [bulkEmail, setBulkEmail] = useState('')
  const [isSendingEmails, setIsSendingEmails] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteProgress, setDeleteProgress] = useState(0)
  const { toast } = useToast()
  const deleteMonthlyMeeting = useDeleteMonthlyMeeting()

  const handleBulkDelete = async () => {
    setIsDeleting(true)
    setDeleteProgress(0)

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < selectedMeetings.length; i++) {
      const meeting = selectedMeetings[i]

      try {
        await new Promise<void>((resolve, reject) => {
          deleteMonthlyMeeting.mutate(meeting.id, {
            onSuccess: () => resolve(),
            onError: () => reject(),
          })
        })

        successCount++
      } catch {
        failCount++
      }

      setDeleteProgress(Math.round(((i + 1) / selectedMeetings.length) * 100))
    }

    setIsDeleting(false)
    setShowDeleteDialog(false)
    onClearSelection()

    if (failCount === 0) {
      toast({
        title: 'Meetings Deleted',
        description: `Successfully deleted ${successCount} meeting${successCount > 1 ? 's' : ''}.`,
      })
    } else {
      toast({
        title: 'Partial Success',
        description: `Deleted ${successCount} meeting(s), ${failCount} failed.`,
        variant: 'destructive',
      })
    }
  }

  const handleBulkEmail = async () => {
    if (!bulkEmail) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(bulkEmail)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      })

      return
    }

    setIsSendingEmails(true)

    let successCount = 0
    let failCount = 0

    for (const meeting of selectedMeetings) {
      try {
        await edgeFunctionsApi.monthlyMeetings(meeting.id, bulkEmail)

        successCount++
      } catch {
        failCount++
      }
    }

    setIsSendingEmails(false)
    setShowEmailDialog(false)
    setBulkEmail('')
    onClearSelection()

    if (failCount === 0) {
      toast({
        title: 'Reports Sent',
        description: `Successfully sent ${successCount} report${successCount > 1 ? 's' : ''} to ${bulkEmail}.`,
      })
    } else {
      toast({
        title: 'Partial Success',
        description: `Sent ${successCount} report(s), ${failCount} failed.`,
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium text-blue-900'>
              {selectedCount} meeting{selectedCount > 1 ? 's' : ''} selected
            </span>
            <Button
              variant='ghost'
              size='sm'
              onClick={onClearSelection}
              className='text-blue-600 hover:text-blue-800 hover:bg-blue-100'>
              <X className='w-4 h-4' />
            </Button>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowEmailDialog(true)}
              className='text-blue-700 border-blue-300 hover:bg-blue-100'>
              <Mail className='w-4 h-4 mr-2' />
              Email Reports
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowDeleteDialog(true)}
              className='text-red-600 border-red-300 hover:bg-red-50'>
              <Trash2 className='w-4 h-4 mr-2' />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedCount} Meeting{selectedCount > 1 ? 's' : ''}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} meeting{selectedCount > 1 ? 's' : ''}?
              This action cannot be undone.
              <span className='block mt-2 font-medium text-orange-600'>
                All associated student updates will also be deleted.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className='bg-red-600 hover:bg-red-700'
              disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Deleting... {deleteProgress}%
                </>
              ) : (
                <>
                  <Trash2 className='w-4 h-4 mr-2' />
                  Delete All
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Send {selectedCount} Meeting Report{selectedCount > 1 ? 's' : ''}
            </DialogTitle>
            <DialogDescription>
              Send all selected meeting reports to a single email address.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='bulk-email'>Email Address</Label>
              <Input
                id='bulk-email'
                type='email'
                placeholder='Enter email address'
                value={bulkEmail}
                onChange={e => setBulkEmail(e.target.value)}
                disabled={isSendingEmails}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowEmailDialog(false)}
              disabled={isSendingEmails}>
              Cancel
            </Button>
            <Button onClick={handleBulkEmail} disabled={isSendingEmails || !bulkEmail}>
              {isSendingEmails ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className='w-4 h-4 mr-2' />
                  Send All Reports
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MonthlyMeetingBulkActions
