interface GenericReportViewProps {
  reportType: string | null
  data: unknown
}

const GenericReportView = ({ reportType, data }: GenericReportViewProps) => {
  return (
    <div className='space-y-4'>
      <h1 className='text-xl font-semibold text-gray-900'>
        {reportType?.replace(/_/g, ' ') || 'Report'}
      </h1>
      <pre className='text-xs bg-gray-50 rounded p-4 overflow-x-auto whitespace-pre-wrap'>
        {JSON.stringify(data, null, 2)}
      </pre>
      <p className='text-sm text-gray-500'>
        This report type doesn't have a dedicated view yet — build one following the pattern in
        StudentSpeechReportView.tsx, consuming this same data shape.
      </p>
    </div>
  )
}

export default GenericReportView
