export const ReportBanner = ({
  title,
  titleClassName = 'text-3xl',
}: {
  title: string
  titleClassName?: string
}) => (
  <div className='bg-[#5b7a8b] px-10 py-6 flex items-center justify-between'>
    <h1 className={`text-white font-['Gotu'] ${titleClassName}`}>{title}</h1>
    <div className='flex items-center'>
      <img src='/icon.png' alt='' className='w-7 h-7 rounded mr-2' />
      <div className='leading-tight'>
        <p className='font-bold text-[9px] tracking-wide text-white'>NORTHERN VOICES</p>
        <p className="font-['Montserrat'] text-[6px] tracking-[0.2em] text-gray-200">
          SPEECH SERVICES
        </p>
      </div>
    </div>
  </div>
)

export const ReportFooter = ({
  page,
  of,
  brand,
}: {
  page?: number
  of?: number
  brand: string
}) => (
  <div className='flex items-center justify-between border-t border-gray-200 pt-3 text-xs text-gray-500 px-10 pb-6'>
    <span>{brand}</span>
    <span className='flex items-center gap-2'>
      <img src='/icon.png' alt='' className='w-4 h-4' />
      {page !== undefined && of !== undefined ? (
        <>
          {page} of {of}
        </>
      ) : (
        '1 of 1'
      )}
    </span>
  </div>
)
