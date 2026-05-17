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
import { useDocuments, useDeleteDocument } from '@/hooks/documents/use-documents'
import { documentsApi, Document } from '@/api/documents'
import { Loader2, Plus, Trash2, Eye, FileImage } from 'lucide-react'
import { format } from 'date-fns'
import AttendanceSheetModal from './AttendanceSheetModal'

interface AttendanceSheetsSectionProps {
  schoolId: string
}

const AttendanceSheetsSection = ({ schoolId }: AttendanceSheetsSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sheetToDelete, setSheetToDelete] = useState<{
    id: string
    filePath: string
    fileName: string
  } | null>(null)

  const { toast } = useToast()

  const { data: sheets = [], isLoading } = useDocuments(schoolId, 'attendance_sheet')
  const deleteMutation = useDeleteDocument(schoolId)

  const handleView = async (doc: Document) => {
    try {
      const url = await documentsApi.getSignedUrl(doc.file_path)
      window.open(url, '_blank')
    } catch {
      toast({
        title: 'Error',
        description: 'Could not open file. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = (id: string, filePath: string, fileName: string) => {
    deleteMutation.mutate(
      {
        id,
        filePath,
      },
      {
        onSuccess: () => {
          toast({ title: 'File deleted', description: `${fileName} has been removed.` })
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
}
