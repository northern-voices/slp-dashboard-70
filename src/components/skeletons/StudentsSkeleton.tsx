import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
const StudentsSkeleton = () => {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-32' />
          <Skeleton className='h-4 w-56' />
        </div>
        <Skeleton className='h-9 w-32' />
      </div>

      {/* Filters */}
      <div className='flex flex-col gap-3 sm:flex-row'>
        <Skeleton className='h-9 flex-1' />
        <Skeleton className='h-9 w-36' />
        <Skeleton className='h-9 w-36' />
        <Skeleton className='h-9 w-36' />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <Skeleton className='h-5 w-40' />
        </CardHeader>
        <CardContent>
          <div className='space-y-0'>
            {/* Table header */}
            <div className='grid grid-cols-4 border-b pb-3 mb-1'>
              {['w-16', 'w-12', 'w-20', 'w-24'].map((w, i) => (
                <Skeleton key={i} className={`h-4 ${w}`} />
              ))}
            </div>

            {/* Table rows */}
            {[...Array(8)].map((_, i) => (
              <div key={i} className='grid grid-cols-4 py-4 border-b last:border-0'>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-7 w-7 rounded-full shrink-0' />
                  <Skeleton className='h-4 w-28' />
                </div>
                <Skeleton className='h-4 w-12 self-center' />
                <Skeleton className='h-5 w-20 rounded-full self-center' />
                <Skeleton className='h-4 w-24 self-center' />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StudentsSkeleton
