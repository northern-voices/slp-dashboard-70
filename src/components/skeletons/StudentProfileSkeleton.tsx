import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const StudentProfileSkeleton = () => {
  return (
    <main className='flex-1 p-4 md:p-6 lg:p-8 pb-8'>
      {/* Pagination bar */}
      <div className='flex items-center justify-between mb-6'>
        <Skeleton className='h-8 w-24' />
        <div className='flex items-center gap-2'>
          <Skeleton className='h-8 w-8' />
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-8 w-8' />
        </div>
      </div>

      <div className='space-y-6'>
        {/* Student Info Header */}
        <Card>
          <CardContent className='pt-6'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
              <div className='flex items-center gap-4'>
                <Skeleton className='h-16 w-16 rounded-full shrink-0' />
                <div className='space-y-2'>
                  <Skeleton className='h-6 w-40' />
                  <div className='flex gap-2'>
                    <Skeleton className='h-5 w-20 rounded-full' />
                    <Skeleton className='h-5 w-24 rounded-full' />
                  </div>
                </div>
              </div>
              <div className='flex gap-2'>
                <Skeleton className='h-9 w-28' />
                <Skeleton className='h-9 w-28' />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4 mt-6 sm:grid-cols-4'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='space-y-1'>
                  <Skeleton className='h-3 w-20' />
                  <Skeleton className='h-5 w-24' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Screening History */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-5 w-40' />
              <Skeleton className='h-9 w-32' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className='flex items-center justify-between py-2 border-b last:border-0'>
                  <div className='flex items-center gap-3'>
                    <Skeleton className='h-8 w-8 rounded-full' />
                    <div className='space-y-1'>
                      <Skeleton className='h-4 w-32' />
                      <Skeleton className='h-3 w-20' />
                    </div>
                  </div>
                  <Skeleton className='h-5 w-16 rounded-full' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Meetings */}
        <Card>
          <CardHeader>
            <Skeleton className='h-5 w-44' />
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className='flex items-center justify-between py-2 border-b last:border-0'>
                  <Skeleton className='h-4 w-48' />
                  <Skeleton className='h-4 w-24' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Consent Forms */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-5 w-32' />
              <Skeleton className='h-9 w-28' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className='flex items-center justify-between py-2 border-b last:border-0'>
                  <div className='flex items-center gap-3'>
                    <Skeleton className='h-8 w-8 rounded' />
                    <Skeleton className='h-4 w-40' />
                  </div>
                  <Skeleton className='h-8 w-20' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default StudentProfileSkeleton
