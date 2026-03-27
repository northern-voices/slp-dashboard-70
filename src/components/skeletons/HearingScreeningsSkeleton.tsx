import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const HearingScreeningsSkeleton = () => {
  return (
    <div className='max-w-7xl mx-auto'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-6'>
          <div className='space-y-2'>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='h-4 w-64' />
          </div>
          <Skeleton className='h-9 w-36' />
        </div>

        {/* Stats cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-4' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-8 w-16 mb-2' />
                <Skeleton className='h-3 w-20' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className='space-y-6'>
        {/* Filters */}
        <div className='flex flex-col gap-3 sm:flex-row flex-wrap'>
          <Skeleton className='h-9 flex-1 min-w-[200px]' />
          <Skeleton className='h-9 w-36' />
          <Skeleton className='h-9 w-36' />
          <Skeleton className='h-9 w-36' />
          <Skeleton className='h-9 w-36' />
        </div>

        {/* Table */}
        <div className='overflow-hidden bg-white border border-gray-200 rounded-lg'>
          <table className='w-full'>
            <thead>
              <tr>
                {['w-4', 'w-24', 'w-16', 'w-20', 'w-16', 'w-20'].map((w, i) => (
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
                    <div className='space-y-1'>
                      <Skeleton className='h-4 w-32' />
                      <Skeleton className='h-3 w-20' />
                    </div>
                  </td>
                  <td className='p-4'>
                    <Skeleton className='h-4 w-12' />
                  </td>
                  <td className='p-4'>
                    <Skeleton className='h-6 w-20 rounded-full' />
                  </td>
                  <td className='p-4'>
                    <Skeleton className='h-4 w-20' />
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
    </div>
  )
}

export default HearingScreeningsSkeleton
