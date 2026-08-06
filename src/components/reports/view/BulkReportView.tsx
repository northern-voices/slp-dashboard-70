import BulkDocumentView from './BulkDocumentView'

interface BulkDocument {
  metadata?: { file_name?: string; directory?: string }
  template?: { name?: string; version?: number }
  context: Record<string, unknown>
}

interface BulkReportData {
  documents: BulkDocument[]
  school_name?: string
  academic_year?: string
  record_id?: string | null
}

const BulkReportView = ({ data }: { data: BulkReportData }) => {
  const documents = data.documents ?? []

  if (documents.length === 0) {
    return (
      <div className='bg-white rounded-lg shadow p-8 text-gray-500'>
        No documents in this report.
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {documents.map((doc, i) => (
        <BulkDocumentView key={i} data={doc} />
      ))}
    </div>
  )
}

export default BulkReportView
