import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { documentsApi, documentTypeLabel, DocumentType } from '@/api/documents'
import { format } from 'date-fns'
import { Loader2, Download, ImageOff, Pencil, Check, X } from 'lucide-react'
import { useUpdateDocumentFileName } from '@/hooks/students/use-documents'

interface DocumentDetails {
  id: string
  document_type: DocumentType
  document_date: string
  additional_notes: string | null
  file_name: string | null
  file_path: string | null
  file_type: string | null
  uploaded_at: string
  uploaded_by: {
    id: string
    first_name: string
    last_name: string
  } | null
}

interface DocumentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  document: DocumentDetails | null
}

const DocumentDetailsModal = ({ isOpen, onClose, document: doc }: DocumentDetailsModalProps) => {
  const { toast } = useToast()
  const [loadingDownload, setLoadingDownload] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState(false)
  const [fileName, setFileName] = useState(doc?.file_name ?? '')
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')

  const updateFileNameMutation = useUpdateDocumentFileName()

  useEffect(() => {
    setFileName(doc?.file_name ?? '')
    setIsEditingName(false)
  }, [doc?.id, doc?.file_name])

  useEffect(() => {
    const isImage = doc?.file_type?.startsWith('image/') ?? false

    if (!isOpen || !doc?.file_path || !isImage) {
      setPreviewUrl(null)
      setPreviewError(false)
      return
    }

    let cancelled = false
    setPreviewUrl(null)
    setPreviewError(false)

    documentsApi
      .getSignedUrl(doc.file_path)
      .then(url => {
        if (!cancelled) setPreviewUrl(url)
      })
      .catch(() => {
        if (!cancelled) setPreviewError(true)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, doc?.file_path, doc?.file_type])

  if (!doc) return null

  const handleDownload = async () => {
    if (!doc.file_path) return
    setLoadingDownload(true)

    try {
      const url = previewUrl ?? (await documentsApi.getSignedUrl(doc.file_path))
      const response = await fetch(url)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)

      const a = window.document.createElement('a')
      a.href = objectUrl
      a.download = fileName || 'document'
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      URL.revokeObjectURL(objectUrl)
    } catch {
      toast({
        title: 'Error',
        description: 'Could not download the file. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoadingDownload(false)
    }
  }

  const handleStartEditing = () => {
    setEditedName(fileName)
    setIsEditingName(true)
  }

  const handleCancelEditing = () => {
    setIsEditingName(false)
  }

  const handleSaveFileName = async () => {
    const trimmed = editedName.trim()

    if (!trimmed || trimmed === fileName) {
      setIsEditingName(false)
      return
    }

    try {
      await updateFileNameMutation.mutateAsync({ id: doc.id, fileName: trimmed })
      setFileName(trimmed)
      setIsEditingName(false)
      toast({ title: 'File renamed', description: 'The file name has been updated.' })
    } catch {
      toast({
        title: 'Error',
        description: 'Could not rename the file. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Document Details</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 text-sm'>
          {/* Date & Uploaded by */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-xs text-muted-foreground'>Document Date</p>
              <p className='font-medium'>{format(new Date(doc.document_date), 'MMM d, yyyy')}</p>
            </div>

            <div>
              <p className='text-xs text-muted-foreground'>Recorded By</p>
              <p className='font-medium'>
                {doc.uploaded_by
                  ? `${doc.uploaded_by.first_name} ${doc.uploaded_by.last_name}`
                  : '-'}
              </p>
            </div>
          </div>

          {/* Type */}
          <div>
            <p className='text-xs text-muted-foreground'>Type</p>
            <p className='font-medium'>{documentTypeLabel(doc.document_type)}</p>
          </div>

          {/* Uploaded file (image, pdf, or doc) */}
          {doc.file_path && (
            <div>
              <p className='text-xs text-muted-foreground'>Uploaded File</p>

              <div className='mt-1 flex items-center justify-between rounded-md border px-3 py-2'>
                {isEditingName ? (
                  <div className='flex flex-1 items-center gap-2'>
                    <Input
                      value={editedName}
                      onChange={e => setEditedName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveFileName()
                        if (e.key === 'Escape') handleCancelEditing()
                      }}
                      autoFocus
                      className='h-8'
                    />
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={handleSaveFileName}
                      disabled={updateFileNameMutation.isPending}
                      className='h-8 w-8 p-0 shrink-0'>
                      <Check className='h-4 w-4' />
                    </Button>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={handleCancelEditing}
                      disabled={updateFileNameMutation.isPending}
                      className='h-8 w-8 p-0 shrink-0'>
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                ) : (
                  <button
                    type='button'
                    onClick={handleStartEditing}
                    className='flex flex-1 items-center gap-1.5 truncate text-left text-sm text-muted-foreground hover:text-foreground'
                    title='Rename file'>
                    <span className='truncate'>{fileName || 'Document file'}</span>
                    <Pencil className='h-3.5 w-3.5 shrink-0 opacity-50' />
                  </button>
                )}

                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleDownload}
                  disabled={loadingDownload}>
                  {loadingDownload ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <Download className='mr-2 h-4 w-4' />
                  )}
                  Download
                </Button>
              </div>

              {doc.file_type?.startsWith('image/') && (
                <div className='relative mt-2 flex h-64 items-center justify-center overflow-hidden rounded-md border bg-muted/30'>
                  {!previewUrl && !previewError && (
                    <>
                      <div className='absolute inset-0 animate-pulse bg-muted' />
                      <Loader2 className='relative h-6 w-6 animate-spin text-muted-foreground' />
                    </>
                  )}

                  {previewError && (
                    <div className='flex flex-col items-center gap-1 text-muted-foreground'>
                      <ImageOff className='h-6 w-6' />
                      <span className='text-xs'>Could not load preview</span>
                    </div>
                  )}

                  {previewUrl && (
                    <a
                      href={previewUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex h-full w-full items-center justify-center'>
                      <img
                        src={previewUrl}
                        alt={fileName || 'Document'}
                        className='max-h-full max-w-full object-contain'
                      />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Additional notes */}
          {doc.additional_notes && (
            <div>
              <p className='text-xs text-muted-foreground'>Additional Notes</p>
              <p className='mt-1 whitespace-pre-wrap rounded-md bg-muted px-3 py-2'>
                {doc.additional_notes}
              </p>
            </div>
          )}

          {/* Recorded at */}
          <p className='text-xs text-muted-foreground'>
            Recorded on {format(new Date(doc.uploaded_at), 'MMM d, yyyy · h:mm a')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DocumentDetailsModal
