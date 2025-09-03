import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, Plus, List } from 'lucide-react'

interface SubmissionConfirmationModalProps {
  isOpen: boolean
  onNewScreening: () => void
  onGoToDashboard: () => void
  studentName?: string
}

const SubmissionConfirmationModal: React.FC<SubmissionConfirmationModalProps> = ({
  isOpen,
  onNewScreening,
  onGoToDashboard,
  studentName,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className='mx-auto'>
        <div className='flex flex-col items-center text-center space-y-6'>
          {/* Success Icon */}
          <div className='flex justify-center'>
            <CheckCircle className='w-16 h-16 text-green-600' />
          </div>

          {/* Title and Description */}
          <div className='space-y-2'>
            <DialogTitle className='text-2xl font-semibold text-gray-900'>
              Screening Submitted Successfully!
            </DialogTitle>
            <DialogDescription className='text-gray-600 text-base leading-relaxed'>
              {studentName
                ? `Speech screening for ${studentName} has been recorded successfully.`
                : 'Your speech screening has been recorded successfully.'}
            </DialogDescription>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
            <Button
              onClick={onNewScreening}
              className='w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2'>
              <Plus className='w-4 h-4' />
              Submit New Screening
            </Button>
            <Button
              onClick={onGoToDashboard}
              variant='outline'
              className='w-full sm:w-auto px-6 py-2'>
              <List className='w-4 h-4' />
              Go to Screenings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SubmissionConfirmationModal
