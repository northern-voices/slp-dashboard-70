import { Skeleton } from '@/components/ui/skeleton'

const ScreeningsTableSkeleton = () => {
  return (
    <div className='space-y-4'>
      <div className='flex justify-end mb-3'>
        <Skeleton className='h-7 w-32 rounded-full' />
      </div>

      <div className='overflow-hidden bg-white border border-gray-200 rounded-lg'>
        <table className='w-full'>
          <thead>
            <tr>
              {['w-4', 'w-20', 'w-16', 'w-20', 'w-14', 'w-12', 'w-20'].map((w, i) => (
                <th key={i} className='p-4'>
                  <Skeleton className={`h-4 ${w}`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className='border-t border-gray-200'>
                <td className='p-4'>
                  <Skeleton className='h-4 w-4' />
                </td>
                <td className='p-4'>
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                </td>
                <td className='p-4'>
                  <Skeleton className='h-6 w-20 rounded-full' />
                </td>
                <td className='p-4'>
                  <Skeleton className='h-6 w-24 rounded-full' />
                </td>
                <td className='p-4'>
                  <Skeleton className='h-4 w-8' />
                </td>
                <td className='p-4'>
                  <Skeleton className='h-4 w-20' />
                </td>
                <td className='p-4'>
                  <Skeleton className='h-4 w-24' />
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

export default ScreeningsTableSkeleton
