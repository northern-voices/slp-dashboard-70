import { Screening } from '@/types/database'
import ScreeningTableRow from './ScreeningTableRow'

interface ScreeningTableProps {
  screenings: Screening[]
  title: string
  emptyMessage?: string
}

const ScreeningTable = ({
  screenings,
  title,
  emptyMessage = 'No screenings found.',
}: ScreeningTableProps) => (
  <div>
    <h3 className='mb-3 text-lg font-semibold text-gray-900'>{title}</h3>
    {screenings.length > 0 ? (
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b'>
              <th className='p-4 font-medium text-left text-gray-700'>Type</th>
              <th className='p-4 font-medium text-left text-gray-700'>Date</th>
              <th className='p-4 font-medium text-left text-gray-700'>Notes</th>
              <th className='p-4 font-medium text-left text-gray-700'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {screenings.map(screening => (
              <ScreeningTableRow key={screening.id} screening={screening} />
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className='text-sm text-gray-500'>{emptyMessage}</p>
    )}
  </div>
)

export default ScreeningTable
