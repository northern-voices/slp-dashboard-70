import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

const ReportsSkeleton = () => (
  <div className='space-y-6 sm:space-y-8 pb-8'>
    <Skeleton className='h-8 w-24' />

    {[...Array(2)].map((_, i) => (
      <div key={i} className='space-y-4'>
        <Skeleton className='h-5 w-48' />
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
          {[...Array(2)].map((_, j) => (
            <Card key={j} className='rounded-xl'>
              <CardContent className='px-6 py-3'>
                <div className='flex items-center gap-4'>
                  <Skeleton className='w-12 h-12 rounded-lg flex-shrink-0' />
                  <Skeleton className='h-5 w-36' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    ))}
  </div>
)

export default ReportsSkeleton
