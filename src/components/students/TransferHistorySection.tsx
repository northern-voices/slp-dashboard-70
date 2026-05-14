import { useStudentTransferHistory } from '@/hooks/students'

interface TransferHistorySectionProps {
  studentId: string
}

const TransferHistorySection = ({ studentId }: TransferHistorySectionProps) => {
  const { data: transferHistory = [] } = useStudentTransferHistory(studentId)

  if (transferHistory.length === 0) return null

  return (
    <div className='mt-6'>
      <h3 className='mb-3 text-sm font-semibold text-gray-700'>Transfer History</h3>
      <div className='flex flex-col gap-3'>
        {transferHistory.map(transfer => (
          <div
            key={transfer.id}
            className='rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='font-medium text-gray-900'>
                {new Date(transfer.transfer_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              {transfer.transferred_by_user && (
                <span className='text-gray-500'>
                  by {transfer.transferred_by_user.first_name}{' '}
                  {transfer.transferred_by_user.last_name}
                </span>
              )}
            </div>
            <div className='mt-1 text-gray-600'>
              <span>{transfer.from_school?.name ?? '—'}</span>
              <span className='mx-2'>→</span>
              <span>{transfer.to_school?.name ?? '—'}</span>
            </div>
            {(transfer.from_grade || transfer.to_grade) && (
              <div className='mt-0.5 text-gray-500'>
                Grade: {transfer.from_grade?.grade_level ?? '—'} →{' '}
                {transfer.to_grade?.grade_level ?? '—'}
              </div>
            )}
            {transfer.reason && (
              <div className='mt-0.5 italic text-gray-500'>{transfer.reason}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TransferHistorySection
