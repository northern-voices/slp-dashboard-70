import { useMemo, useState } from 'react'
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
  const documents = useMemo(() => data.documents ?? [], [data.documents])

  const studentDocs = useMemo(
    () => documents.filter(doc => !!doc.context?.student_name),
    [documents]
  )
  const summaryDocs = useMemo(
    () => documents.filter(doc => !doc.context?.student_name),
    [documents]
  )

  const groups = useMemo(() => {
    const map = new Map<string, BulkDocument[]>()

    for (const doc of studentDocs) {
      const key = doc.metadata?.directory || 'All Students'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(doc)
    }

    return map
  }, [studentDocs])

  const groupNames = useMemo(() => Array.from(groups.keys()), [groups])

  const [view, setView] = useState<'student' | 'summary'>(
    studentDocs.length === 0 ? 'summary' : 'student'
  )
  const [selectedGroup, setSelectedGroup] = useState(groupNames[0] ?? '')
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (documents.length === 0) {
    return (
      <div className='bg-white rounded-lg shadow p-8 text-gray-500'>
        No documents in this report.
      </div>
    )
  }

  const studentsInGroup = groups.get(selectedGroup) ?? []
  const activeDoc = view === 'summary' ? summaryDocs[0] : studentsInGroup[selectedIndex]

  const handleGroupChange = (group: string) => {
    setSelectedGroup(group)
    setSelectedIndex(0)
  }

  return (
    <div className='space-y-4'>
      <div className='bg-white rounded-lg shadow p-4 flex flex-wrap items-end gap-4 print:hidden'>
        {summaryDocs.length > 0 && (
          <div className='flex flex-col gap-1'>
            <label className='text-xs font-medium text-gray-600'>View</label>
            <select
              value={view}
              onChange={e => setView(e.target.value as 'student' | 'summary')}
              className='border border-gray-300 rounded-md px-3 py-2 text-sm'>
              <option value='student'>Student Report</option>
              <option value='summary'>School Summary</option>
            </select>
          </div>
        )}

        {view === 'student' && (
          <>
            <div className='flex flex-col gap-1'>
              <label className='text-xs font-medium text-gray-600'>Group</label>
              <select
                value={selectedGroup}
                onChange={e => handleGroupChange(e.target.value)}
                className='border border-gray-300 rounded-md px-3 py-2 text-sm'>
                {groupNames.map(name => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className='flex flex-col gap-1'>
              <label className='text-xs font-medium text-gray-600'>Student</label>
              <select
                value={selectedIndex}
                onChange={e => setSelectedIndex(Number(e.target.value))}
                className='border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[200px]'>
                {studentsInGroup.map((doc, i) => (
                  <option key={i} value={i}>
                    {doc.context.student_name as string}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {activeDoc && <BulkDocumentView data={activeDoc} />}
    </div>
  )
}

export default BulkReportView
