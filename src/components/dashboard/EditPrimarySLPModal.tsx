import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { UserCircle } from 'lucide-react'

interface EditPrimarySLPFormData {
  primarySlpId: string | null
}

interface AvailableSLP {
  id: string
  name: string
}

interface EditPrimarySLPModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: EditPrimarySLPFormData) => Promise<void>
  initialData: EditPrimarySLPFormData
  availableSLPs: AvailableSLP[]
  isSaving?: boolean
}

const EditPrimarySLPModal: React.FC<EditPrimarySLPModalProps> = ({
  open,
  onOpenChange,
  onSave,
  initialData,
  availableSLPs,
  isSaving = false,
}) => {
  const { handleSubmit, control, reset } = useForm<EditPrimarySLPFormData>({
    defaultValues: initialData,
  })

  useEffect(() => {
    if (open) {
      reset(initialData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onSubmit = async (data: EditPrimarySLPFormData) => {
    await onSave({
      ...data,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <div className='flex items-center mb-2 space-x-3'>
            <div className='flex items-center justify-center w-10 h-10 bg-indigo-50 rounded-xl'>
              <UserCircle className='w-5 h-5 text-indigo-600' />
            </div>
            <DialogTitle>Edit Primary SLP</DialogTitle>
          </div>
          <DialogDescription>Update the primary SLP's contact information below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='py-4 space-y-2'>
            <Label htmlFor='primarySlpId' className='text-sm font-medium text-gray-700'>
              Primary SLP
            </Label>
            <Controller
              name='primarySlpId'
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || 'none'}
                  onValueChange={value => field.onChange(value === 'none' ? null : value)}>
                  <SelectTrigger className='h-10 border-gray-200 rounded-lg focus:border-brand focus:ring-brand'>
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
              )}
            />
          </div>

          <DialogFooter className='mt-6'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className='leading-none border-gray-200 rounded-lg hover:bg-gray-50'>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSaving}
              className='leading-none text-white rounded-lg bg-brand hover:bg-brand/90'>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditPrimarySLPModal
