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
import ConsentFormDetailsModal from '@/components/students/ConsentFormDetailsModal'
import { ConsentFormWithStudent } from '@/api/consentForms'

interface ConsentTableProps {
  forms: ConsentFormWithStudent[]
  isLoading: boolean
}

const purposeLabel = (purpose: string) =>
  purpose === 'screening_assessment' ? 'Screening / Assessment' : 'Therapy'

const typeLabel = (type: string) => (type === 'verbal' ? 'Verbal' : 'Written')

const ConsentTable = ({ forms, isLoading }: ConsentTableProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedForm, setSelectedForm] = useState<ConsentFormWithStudent | null>(null)

  const filteredForms = useMemo(() => {
    if (!searchTerm) return forms
    const term = searchTerm.toLowerCase()

    return forms.filter(form => {
      const name =
        `${form.student?.first_name ?? ''} ${form.student?.last_name ?? ''}`.toLowerCase()
      return name.includes(term)
    })
  }, [forms, searchTerm])

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
              <TableHead>Purpose</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Recorded By</TableHead>
            </tr>
          </TableHeader>

          <TableBody>
            {filteredForms.map(form => (
              <ResponsiveTableRow
                key={form.id}
                className='cursor-pointer hover:bg-gray-50'
                onClick={() => setSelectedForm(form)}>
                <TableCell className='font-medium'>
                  {form.student ? `${form.student.first_name} ${form.student.last_name}` : '-'}
                </TableCell>

                <TableCell>{purposeLabel(form.consent_purpose)}</TableCell>

                <TableCell>{typeLabel(form.consent_type)}</TableCell>

                <TableCell>{format(new Date(form.consent_date), 'MMM d, yyyy')}</TableCell>

                <TableCell>
                  {form.file_name ? (
                    <span className='flex items-center gap-1 text-muted-foreground'>
                      <FileText className='w-4 h-4' />
                      {form.file_name}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>

                <TableCell>
                  {form.uploaded_by
                    ? `${form.uploaded_by.first_name} ${form.uploaded_by.last_name}`
                    : '-'}
                </TableCell>
              </ResponsiveTableRow>
            ))}
          </TableBody>
        </ResponsiveTable>

        {filteredForms.length === 0 && (
          <div className='py-8 text-center'>
            <p className='text-gray-500'>
              {searchTerm
                ? 'No consent forms found matching your search.'
                : 'No consent forms recorded yet.'}
            </p>
          </div>
        )}
      </div>

      <ConsentFormDetailsModal
        isOpen={!!selectedForm}
        onClose={() => setSelectedForm(null)}
        form={selectedForm}
      />
    </div>
  )
}

export default ConsentTable
