import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface SortOption {
  label: string
  value: string
  defaultDirection?: 'asc' | 'desc'
}

interface SortControlsProps {
  sortField: string | null
  setSortField: (field: string | null) => void
  sortOrder: 'asc' | 'desc' | null
  setSortOrder: (order: 'asc' | 'desc' | null) => void
  options: SortOption[]
}

const SortControls = ({
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  options,
}: SortControlsProps) => {
  const handleFieldChange = (value: string) => {
    if (value === 'none') {
      setSortField(null)
      setSortOrder(null)
    } else {
      setSortField(value)
      const option = options.find(option => option.value === value)
      setSortOrder(option?.defaultDirection ?? 'asc')
    }
  }

  return (
    <div className='flex items-center gap-3'>
      <div className='flex items-center gap-2'>
        <label className='text-sm font-medium text-gray-700 whitespace-nowrap'>Sort by</label>
        <Select value={sortField ?? 'none'} onValueChange={handleFieldChange}>
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='None' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='none'>None</SelectItem>
            {options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {sortField && (
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium text-gray-700'>Order</label>
          <Select
            value={sortOrder ?? 'asc'}
            onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
            <SelectTrigger className='w-36'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='asc'>Ascending</SelectItem>
              <SelectItem value='desc'>Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}

export default SortControls
