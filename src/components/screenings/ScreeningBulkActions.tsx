import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Trash2, Mail, X, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Screening } from '@/types/database'
import ExportScreeningsModal from './ExportScreeningsModal'
import SendReportsModal from './SendReportsModal'
import DeleteScreeningsModal from './DeleteScreeningsModal'
import StatusUpdateModal from './StatusUpdateModal'

interface ScreeningBulkActionsProps {
  selectedCount: number
  selectedScreenings: Screening[]
  onBulkAction: (action: string) => void
  onClearSelection: () => void
}

const ScreeningBulkActions = ({
  selectedCount,
  selectedScreenings,
  onBulkAction,
  onClearSelection,
}: ScreeningBulkActionsProps) => {
  const [showExportModal, setShowExportModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const { toast } = useToast()

  const handleExport = () => {
    setShowExportModal(true)
  }

  const handleEmailReports = () => {
    setShowEmailModal(true)
  }

  const handleDelete = () => {
    setShowDeleteModal(true)
  }

  const handleStatusUpdate = () => {
    setShowStatusModal(true)
  }

  const handleActionComplete = (action: string) => {
    onBulkAction(action)
    onClearSelection()

    if (action === 'delete') {
      toast({
        title: 'Screenings deleted',
        description: `Successfully deleted ${selectedCount} screening${
          selectedCount > 1 ? 's' : ''
        }`,
        variant: 'default',
      })
    } else {
      toast({
        title: 'Action Completed',
        description: `${action} completed successfully for ${selectedCount} screening${
          selectedCount > 1 ? 's' : ''
        }`,
      })
    }
  }

  return (
    <>
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium text-blue-900'>
              {selectedCount} screening{selectedCount > 1 ? 's' : ''} selected
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
            {/* <Button
              variant='outline'
              size='sm'
              onClick={handleExport}
              className='text-blue-700 border-blue-300 hover:bg-blue-100'>
              <Download className='w-4 h-4 mr-2' />
              Export
            </Button> */}
            <Button
              variant='outline'
              size='sm'
              onClick={handleEmailReports}
              className='text-blue-700 border-blue-300 hover:bg-blue-100'>
              <Mail className='w-4 h-4 mr-2' />
              Email Reports
            </Button>
            {/* <Button
              variant='outline'
              size='sm'
              onClick={handleStatusUpdate}
              className='text-blue-700 border-blue-300 hover:bg-blue-100'>
              <RefreshCw className='w-4 h-4 mr-2' />
              Update Status
            </Button> */}
            <Button
              variant='outline'
              size='sm'
              onClick={handleDelete}
              className='text-red-600 border-red-300 hover:bg-red-50'>
              <Trash2 className='w-4 h-4 mr-2' />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <ExportScreeningsModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        selectedScreenings={selectedScreenings}
        onExport={handleActionComplete}
      />

      {/* <SendReportsModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        selectedScreenings={selectedScreenings}
        onSend={handleActionComplete}
      /> */}

      <StatusUpdateModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        selectedScreenings={selectedScreenings}
        onUpdate={handleActionComplete}
      />

      <DeleteScreeningsModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        selectedScreenings={selectedScreenings}
        selectedCount={selectedCount}
        onDelete={handleActionComplete}
      />
    </>
  )
}

export default ScreeningBulkActions
