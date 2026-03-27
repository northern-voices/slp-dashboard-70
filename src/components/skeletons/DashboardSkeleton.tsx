import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const DashboardSkeleton = () => {
  return (
    <>
      {/* Page Header */}
      <div className='mb-8 space-y-2'>
        <Skeleton className='h-7 w-48' />
        <Skeleton className='h-4 w-80' />
      </div>

      {/* Cards Grid */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8'>
        {/* School Info Card */}
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-5 w-32' />
              <Skeleton className='h-8 w-16' />
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-40' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-32' />
            </div>
            <div className='space-y-3 pt-2'>
              <Skeleton className='h-4 w-28' />
              {[...Array(3)].map((_, i) => (
                <div key={i} className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-7 w-7 rounded-full' />
                    <Skeleton className='h-4 w-28' />
                  </div>
                  <Skeleton className='h-5 w-16 rounded-full' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Log Card */}
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-5 w-28' />
              <Skeleton className='h-8 w-28' />
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='flex items-start gap-3'>
                <Skeleton className='h-8 w-8 rounded-full shrink-0' />
                <div className='flex-1 space-y-1.5'>
                  <Skeleton className='h-4 w-36' />
                  <Skeleton className='h-3 w-24' />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default DashboardSkeleton
