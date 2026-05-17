import { useState } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  useAttendanceSheets,
  useDeleteAttendanceSheet,
} from '@/hooks/attendanceSheets/use-attendance-sheets'
import { attendanceSheetsApi, AttendanceSheet } from '@/api/attendanceSheets'
import { Loader2, Plus, Trash2, Eye, FileImage, FileX } from 'lucide-react'
import { format } from 'date-fns'
import AttendanceSheetModal from './AttendanceSheetModal'

interface AttendanceSheetsSectionProps {
  schoolId: string
}

const AttendanceSheetsSection = ({ schoolId }: AttendanceSheetsSectionProps) => {
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sheetToDelete, setSheetToDelete] = useState<{
    id: string
    filePath: string | null
    fileName: string
  } | null>(null)

  const { data: sheets = [], isLoading } = useAttendanceSheets(schoolId)
  const deleteMutation = useDeleteAttendanceSheet(schoolId)

  const handleView = async (sheet: AttendanceSheet) => {
    if (!sheet.file_path) return
    try {
      const url = await attendanceSheetsApi.getSignedUrl(sheet.file_path)
      window.open(url, '_blank')
    } catch {
      toast({
        title: 'Error',
        description: 'Could not open file. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = (id: string, filePath: string | null, fileName: string) => {
    deleteMutation.mutate(
      { id, filePath },
      {
        onSuccess: () => {
          toast({ title: 'Record deleted', description: `${fileName} has been removed.` })
          setSheetToDelete(null)
        },
        onError: () => {
          toast({
            title: 'Error',
            description: `Failed to delete ${fileName}. Please try again.`,
            variant: 'destructive',
          })
        },
      }
    )
  }

  return (
    <>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='text-lg font-semibold'>Attendance Sheets</CardTitle>
          <Button size='sm' onClick={() => setIsModalOpen(true)}>
            <Plus className='w-4 h-4' />
            Add
          </Button>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className='flex justify-center py-6'>
              <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
            </div>
          ) : sheets.length === 0 ? (
            <div className='flex flex-col items-center gap-2 py-8 text-muted-foreground'>
              <FileImage className='w-8 h-8' />
              <p className='text-sm'>No attendance sheets recorded yet.</p>
            </div>
          ) : (
            <ul className='divide-y'>
              {sheets.map(sheet => (
                <li key={sheet.id} className='flex items-center justify-between py-3'>
                  <div className='flex flex-col'>
                    <span className='text-sm font-medium'>
                      {sheet.provision_status === 'not_provided'
                        ? 'Not provided by school'
                        : sheet.file_name}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      {sheet.sheet_date
                        ? format(new Date(sheet.sheet_date), 'MMMM yyyy')
                        : format(new Date(sheet.uploaded_at), 'MMM d, yyyy')}
                      {sheet.uploaded_by &&
                        ` · ${sheet.uploaded_by.first_name} ${sheet.uploaded_by.last_name}`}
                    </span>
                  </div>
                  <div className='flex gap-2'>
                    {sheet.provision_status === 'uploaded' && (
                      <Button size='sm' variant='outline' onClick={() => handleView(sheet)}>
                        <Eye className='w-4 h-4' />
                      </Button>
                    )}
                    {sheet.provision_status === 'not_provided' && (
                      <Button size='sm' variant='outline' disabled>
                        <FileX className='w-4 h-4 text-muted-foreground' />
                      </Button>
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() =>
                        setSheetToDelete({
                          id: sheet.id,
                          filePath: sheet.file_path,
                          fileName: sheet.file_name ?? 'this record',
                        })
                      }
                      disabled={deleteMutation.isPending}>
                      <Trash2 className='w-4 h-4 text-destructive' />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <AttendanceSheetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        schoolId={schoolId}
      />

      <AlertDialog open={!!sheetToDelete} onOpenChange={() => setSheetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attendance Sheet?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              <span className='font-medium text-foreground'>{sheetToDelete?.fileName}</span>. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={() => {
                if (sheetToDelete) {
                  handleDelete(sheetToDelete.id, sheetToDelete.filePath, sheetToDelete.fileName)
                }
              }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default AttendanceSheetsSection
