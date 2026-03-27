import { Skeleton } from '@/components/ui/skeleton'

const MonthlyMeetingsSkeleton = () => {
  return (
    <div className='space-y-4'>
      <div className='flex justify-end mb-3'>
        <Skeleton className='h-7 w-32 rounded-full' />
      </div>

      <div className='overflow-hidden bg-white border border-gray-200 rounded-lg'>
        <table className='w-full'>
          <thead>
            <tr>
              {['w-4', 'w-32', 'w-24', 'w-40', 'w-28', 'w-8'].map((w, i) => (
                <th key={i} className='p-4'>
                  <Skeleton className={`h-4 ${w}`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(6)].map((_, i) => (
              <tr key={i} className='border-t border-gray-200'>
                <td className='p-4'>
                  <Skeleton className='h-4 w-4' />
                </td>
                <td className='p-4'>
                  <Skeleton className='h-4 w-40' />
                </td>
                <td className='p-4'>
                  <Skeleton className='h-4 w-24' />
                </td>
                <td className='p-4'>
                  <Skeleton className='h-4 w-48' />
                </td>
                <td className='p-4'>
                  <Skeleton className='h-4 w-28' />
                </td>
                <td className='p-4'>
                  <Skeleton className='h-8 w-8' />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MonthlyMeetingsSkeleton
