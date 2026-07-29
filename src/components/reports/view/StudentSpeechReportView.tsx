interface ProcessedError {
  sound: string
  pattern: string
  example: string
  targetSound: string
  week?: number
}

interface StudentSpeechReportData {
  metadata?: { file_name?: string }
  template?: { name?: string }
  context: {
    student_name: string
    date_of_screening: string
    grade: string
    errors: ProcessedError[]
    code?: string
  }
}

const StudentSpeechReportView = ({ data }: { data: StudentSpeechReportData }) => {
  const { context, template } = data

  return (
    <div className='space-y-6'>
      <div className='border-b pb-4'>
        <h1 className='text-2xl font-semibold text-gray-900'>{context.student_name}</h1>
        <p className='text-sm text-gray-500'>
          Grade {context.grade} · Screened {context.date_of_screening}
        </p>
        {template?.name && (
          <p className='text-sm font-medium text-blue-700 mt-1'>{template.name}</p>
        )}
      </div>

      {context.errors.length === 0 ? (
        <p className='text-gray-600'>No speech sound errors were identified in this screening.</p>
      ) : (
        <div className='space-y-3'>
          <h2 className='text-sm font-medium text-gray-900'>Error Patterns</h2>
          <table className='w-full text-sm border-collapse'>
            <thead>
              <tr className='border-b text-left text-gray-500'>
                <th className='py-2 pr-4'>Sound</th>
                <th className='py-2 pr-4'>Pattern</th>
                <th className='py-2'>Example</th>
              </tr>
            </thead>
            <tbody>
              {context.errors.map((error, i) => (
                <tr key={i} className='border-b last:border-0'>
                  <td className='py-2 pr-4 font-medium'> {error.targetSound || error.sound}</td>
                  <td className='py-2 pr-4'>{error.pattern}</td>
                  <td className='py-2 text-gray-600'>{error.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
