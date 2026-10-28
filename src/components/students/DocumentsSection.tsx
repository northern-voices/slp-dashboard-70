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
import { useDocuments, useDeleteDocument } from '@/hooks/students/use-documents'
import { Loader2, Plus, Trash2, Eye, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { Student } from '@/types/database'
import DocumentModal from './DocumentModal'
import DocumentDetailsModal from '@/components/documents/DocumentDetailsModal'
import { DocumentWithStudent } from '@/api/documents'

interface DocumentsSectionProps {
  student: Student
}

const documentTypeLabel = (type: string) => {
  switch (type) {
    case 'goal_sheet':
      return 'Goal Sheet'
    case 'iep':
      return 'IEP'
    case 'evaluation_report':
      return 'Evaluation Report'
    default:
      return 'Other'
  }
}

const DocumentsSection = ({ student }: DocumentsSectionProps) => {
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithStudent | null>(null)
  const [documentToDelete, setDocumentToDelete] = useState<{
    id: string
    filePath: string | null
    fileName: string
  } | null>(null)

  const { data: documents = [], isLoading } = useDocuments(student.id)
  const deleteMutation = useDeleteDocument(student.id)

  const handleView = (doc: DocumentWithStudent) => {
    setSelectedDocument(doc)
  }

  const handleDelete = (id: string, filePath: string | null, fileName: string) => {
    deleteMutation.mutate(
      { id, filePath },
      {
        onSuccess: () => {
          toast({ title: 'Document deleted', description: `${fileName} has been removed.` })
          setDocumentToDelete(null)
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
          <CardTitle className='text-lg font-semibold'>Documents</CardTitle>
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
          ) : documents.length === 0 ? (
            <div className='flex flex-col items-center gap-2 py-8 text-muted-foreground'>
              <FileText className='w-8 h-8' />
              <p className='text-sm'>No documents recorded yet.</p>
            </div>
          ) : (
            <ul className='divide-y'>
              {documents.map(doc => (
                <li key={doc.id} className='flex items-center justify-between py-3'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-sm font-medium'>{documentTypeLabel(doc.document_type)}</span>
                    {doc.file_name && (
                      <span className='text-xs text-muted-foreground'>{doc.file_name}</span>
                    )}
                    <span className='text-xs text-muted-foreground'>
                      {format(new Date(doc.document_date), 'MMM d, yyyy')}
                      {doc.uploaded_by &&
                        ` · ${doc.uploaded_by.first_name} ${doc.uploaded_by.last_name}`}
                    </span>
                    {doc.additional_notes && (
                      <span className='text-xs text-muted-foreground italic mt-1'>
                        {doc.additional_notes}
                      </span>
                    )}
                  </div>
                  <div className='flex gap-2'>
                    <Button size='sm' variant='outline' onClick={() => handleView(doc)}>
                      <Eye className='w-4 h-4' />
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() =>
                        setDocumentToDelete({
                          id: doc.id,
                          filePath: doc.file_path,
                          fileName: doc.file_name ?? 'this document',
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

      <DocumentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} student={student} />

      <DocumentDetailsModal
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
        document={selectedDocument}
      />

      <AlertDialog open={!!documentToDelete} onOpenChange={() => setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              <span className='font-medium text-foreground'>{documentToDelete?.fileName}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={() => {
                if (documentToDelete) {
                  handleDelete(documentToDelete.id, documentToDelete.filePath, documentToDelete.fileName)
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

export default DocumentsSection
