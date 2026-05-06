import { Skeleton } from '@/components/ui/skeleton'

const CaseloadSkeleton = () => {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-36' />
          <Skeleton className='h-4 w-52' />
        </div>
      </div>

      {/* Search */}
      <Skeleton className='h-9 w-full' />

      {/* Table */}
      <div className='overflow-hidden border border-gray-200 rounded-lg'>
        {/* Table header */}
        <div className='grid grid-cols-7 gap-4 px-4 py-3 border-b bg-gray-50'>
          {['w-28', 'w-12', 'w-16', 'w-14', 'w-14', 'w-20', 'w-6'].map((w, i) => (
            <Skeleton key={i} className={`h-4 ${w}`} />
          ))}
        </div>

        {/* Table rows */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className='grid grid-cols-7 gap-4 px-4 py-4 border-b last:border-0'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-4 w-10' />
            <Skeleton className='h-5 w-16 rounded-full' />
            <Skeleton className='h-5 w-12 rounded-full' />
            <Skeleton className='h-5 w-14 rounded-full' />
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-6 w-6 rounded' />
          </div>
        ))}
      </div>
    </div>
  )
}

export default CaseloadSkeleton
