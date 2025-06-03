import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle, Clock, Calendar, XCircle } from 'lucide-react'

interface StatusUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  selectedScreenings: string[]
  onUpdate: (action: string) => void
}

const StatusUpdateModal = ({
  isOpen,
  onClose,
  selectedScreenings,
  onUpdate,
}: StatusUpdateModalProps) => {
  const [newStatus, setNewStatus] = useState('')
  const [reason, setReason] = useState('')

  const handleUpdate = () => {
    console.log('Updating screening status:', {
      selectedScreenings,
      newStatus,
      reason,
    })

    onUpdate('status_update')
    onClose()
  }

  const statusOptions = [
    {
      value: 'completed',
      label: 'Completed',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800',
      description: 'Screening has been completed',
    },
    {
      value: 'in_progress',
      label: 'In Progress',
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-800',
      description: 'Screening is currently in progress',
    },
    {
      value: 'scheduled',
      label: 'Scheduled',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-800',
      description: 'Screening has been scheduled',
    },
    {
      value: 'cancelled',
      label: 'Cancelled',
      icon: XCircle,
      color: 'bg-red-100 text-red-800',
      description: 'Screening has been cancelled',
    },
  ]

  const selectedOption = statusOptions.find(option => option.value === newStatus)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Update Screening Status</DialogTitle>
          <DialogDescription>
            Update the status for {selectedScreenings.length} selected screening
            {selectedScreenings.length > 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          <div>
            <label className='text-sm font-medium mb-3 block'>New Status</label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder='Select new status' />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => {
                  const Icon = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className='flex items-center gap-2'>
                        <Icon className='w-4 h-4' />
                        <div>
                          <div className='font-medium'>{option.label}</div>
                          <div className='text-xs text-gray-500'>{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            {selectedOption && (
              <div className='mt-2'>
                <Badge className={selectedOption.color}>{selectedOption.label}</Badge>
              </div>
            )}
          </div>

          <div>
            <label htmlFor='reason' className='text-sm font-medium mb-2 block'>
              Reason for Status Change
            </label>
            <Textarea
              id='reason'
              placeholder='Enter reason for status change (optional)'
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          <div className='bg-gray-50 p-3 rounded-lg'>
            <p className='text-sm text-gray-600'>
              This will update the status for <strong>{selectedScreenings.length}</strong> screening
              {selectedScreenings.length > 1 ? 's' : ''}.
              {reason && (
                <>
                  <br />
                  <span className='font-medium'>Reason:</span> {reason}
                </>
              )}
            </p>
          </div>

          <div className='flex justify-end gap-3'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={!newStatus}>
              <RefreshCw className='w-4 h-4 mr-2' />
              Update Status
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default StatusUpdateModal
