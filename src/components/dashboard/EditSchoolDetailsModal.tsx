import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Edit } from 'lucide-react'

interface EditSchoolDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: SchoolDetailsFormData) => Promise<void>
  initialData: {
    schoolName: string
    schoolPhone: string
    primarySLPId: string | null
  }
  availableSLPs: Array<{ id: string; name: string }>
  isSaving?: boolean
}

export interface SchoolDetailsFormData {
  schoolName: string
  schoolPhone: string
  primarySLPId: string | null
}

const EditSchoolDetailsModal: React.FC<EditSchoolDetailsModalProps> = ({
  open,
  onOpenChange,
  onSave,
  initialData,
  availableSLPs,
  isSaving = false,
}) => {
  const [formData, setFormData] = useState<SchoolDetailsFormData>(initialData)

  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  const handleChange = (field: keyof SchoolDetailsFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <div className='flex items-center space-x-3 mb-2'>
            <div className='w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center'>
              <Edit className='w-5 h-5 text-blue-600' />
            </div>
            <DialogTitle>Edit School Details</DialogTitle>
          </div>
          <DialogDescription>
            Update the school information below. Changes will be saved to the database.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className='space-y-5 py-4'>
            {/* School Name Field */}
            <div className='space-y-2'>
              <Label htmlFor='schoolName' className='text-sm font-medium text-gray-700'>
                School Name <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='schoolName'
                placeholder='e.g., Northern Voices Elementary'
                value={formData.schoolName}
                onChange={e => handleChange('schoolName', e.target.value)}
                className='h-10 rounded-lg border-gray-200 focus:border-brand focus:ring-brand'
                required
              />
            </div>

            {/* School Phone Field */}
            <div className='space-y-2'>
              <Label htmlFor='schoolPhone' className='text-sm font-medium text-gray-700'>
                School Phone Number
              </Label>
              <Input
                id='schoolPhone'
                type='tel'
                placeholder='e.g., (907) 555-0123'
                value={formData.schoolPhone}
                onChange={e => handleChange('schoolPhone', e.target.value)}
                className='h-10 rounded-lg border-gray-200 focus:border-brand focus:ring-brand'
              />
            </div>

            {/* Primary SLP Field */}
            <div className='space-y-2'>
              <Label htmlFor='primarySLP' className='text-sm font-medium text-gray-700'>
                Primary SLP
              </Label>
              <Select
                value={formData.primarySLPId || 'none'}
                onValueChange={value =>
                  handleChange('primarySLPId', value === 'none' ? null : value)
                }>
                <SelectTrigger className='h-10 rounded-lg border-gray-200 focus:border-brand focus:ring-brand'>
                  <SelectValue placeholder='Select primary SLP...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>No Primary SLP</SelectItem>
                  {availableSLPs.map(slp => (
                    <SelectItem key={slp.id} value={slp.id}>
                      {slp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className='mt-6'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className='rounded-lg border-gray-200 hover:bg-gray-50 leading-none'>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSaving}
              className='bg-brand hover:bg-brand/90 text-white rounded-lg leading-none'>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditSchoolDetailsModal
