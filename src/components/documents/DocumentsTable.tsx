import { useMemo, useState } from 'react'
import { Search, FileText, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  ResponsiveTable,
  ResponsiveTableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/responsive-table'
import { format } from 'date-fns'
import DocumentDetailsModal from '@/components/documents/DocumentDetailsModal'
import { DocumentWithStudent } from '@/api/documents'

interface DocumentsTableProps {
  documents: DocumentWithStudent[]
  isLoading: boolean
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

const DocumentsTable = ({ documents, isLoading }: DocumentsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithStudent | null>(null)

  const filteredDocuments = useMemo(() => {
    if (!searchTerm) return documents
    const term = searchTerm.toLowerCase()

    return documents.filter(doc => {
      const name = `${doc.student?.first_name ?? ''} ${doc.student?.last_name ?? ''}`.toLowerCase()
      return name.includes(term)
    })
  }, [documents, searchTerm])

  if (isLoading) {
    return (
      <div className='flex justify-center py-10'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='relative'>
        <Search className='absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2' />

        <Input
          placeholder='Search by student name...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='pl-10'
        />
      </div>

      <div className='overflow-hidden bg-white border border-gray-200 rounded-lg'>
        <ResponsiveTable className='w-full'>
          <TableHeader>
            <tr>
              <TableHead className='w-1/5 min-w-[180px]'>Student</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Recorded By</TableHead>
            </tr>
          </TableHeader>

          <TableBody>
            {filteredDocuments.map(doc => (
              <ResponsiveTableRow
                key={doc.id}
                className='cursor-pointer hover:bg-gray-50'
                onClick={() => setSelectedDocument(doc)}>
                <TableCell className='font-medium'>
                  {doc.student ? `${doc.student.first_name} ${doc.student.last_name}` : '-'}
                </TableCell>

                <TableCell>{documentTypeLabel(doc.document_type)}</TableCell>

                <TableCell>{format(new Date(doc.document_date), 'MMM d, yyyy')}</TableCell>

                <TableCell>
                  {doc.file_name ? (
                    <span className='flex items-center gap-1 text-muted-foreground'>
                      <FileText className='w-4 h-4' />
                      {doc.file_name}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>

                <TableCell>
                  {doc.uploaded_by
                    ? `${doc.uploaded_by.first_name} ${doc.uploaded_by.last_name}`
                    : '-'}
                </TableCell>
              </ResponsiveTableRow>
            ))}
          </TableBody>
        </ResponsiveTable>

        {filteredDocuments.length === 0 && (
          <div className='py-8 text-center'>
            <p className='text-gray-500'>
              {searchTerm
                ? 'No documents found matching your search.'
                : 'No documents recorded yet.'}
            </p>
          </div>
        )}
      </div>

      <DocumentDetailsModal
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
        document={selectedDocument}
      />
    </div>
  )
}

export default DocumentsTable
