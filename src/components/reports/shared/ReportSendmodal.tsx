import { CheckCircle, Plus, List, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

interface ReportSendModalProps {
  isOpen: boolean
  modalType: 'success' | 'error'
  modalMessage: string
  onStayOnPage: () => void
  onGoBack: () => void
  onClose: () => void
}

const ReportSendModal = ({
  isOpen,
  modalType,
  modalMessage,
  onStayOnPage,
  onGoBack,
  onClose,
}: ReportSendModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className='mx-auto'>
        <div className='flex flex-col items-center space-y-6 text-center'>
          <div className='flex justify-center'>
            {modalType === 'success' ? (
              <CheckCircle className='w-16 h-16 text-green-600' />
            ) : (
              <XCircle className='w-16 h-16 text-red-600' />
            )}
          </div>

          <div className='space-y-2'>
            <DialogTitle className='text-2xl font-semibold text-gray-900'>
              {modalType === 'success' ? 'Report Sent Successfully!' : 'Error Sending Report'}
            </DialogTitle>
            <DialogDescription className='text-base leading-relaxed text-gray-600'>
              {modalMessage}
            </DialogDescription>
          </div>

          <div className='flex flex-col w-full gap-3 sm:flex-row sm:w-auto'>
            {modalType === 'success' ? (
              <>
                <Button
                  onClick={onStayOnPage}
                  className='w-full px-6 py-2 sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground'>
                  <Plus className='w-4 h-4' />
                  Send Another Report
                </Button>

                <Button onClick={onGoBack} variant='outline' className='w-full px-6 py-2 sm:w-auto'>
                  <List className='w-4 h-4' />
                  Back to Reports
                </Button>
              </>
            ) : (
              <Button
                onClick={onClose}
                className='w-full px-6 py-2 sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground'>
                Try Again
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ReportSendModal
