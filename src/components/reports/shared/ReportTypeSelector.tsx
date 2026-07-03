import { Label } from '@/components/ui/label'
import { LucideIcon } from 'lucide-react'

interface ReportOption {
  value: string
  label: string
  description: string
  icon: LucideIcon
}

interface ReportTypeSelectorProps {
  reports: ReportOption[]
  selectedValues: string[]
  onToggle: (value: string) => void
  columns?: 1 | 2 | 3
}

const ReportTypeSelector = ({
  reports,
  selectedValues,
  onToggle,
  columns = 2,
}: ReportTypeSelectorProps) => {
  const gridClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 3
        ? 'grid-cols-1 lg:grid-cols-3'
        : 'grid-cols-1 lg:grid-cols-2'

  return (
    <div className='space-y-3'>
      <Label className='text-xl font-medium'>Select Type of Report</Label>
      <div className={`grid ${gridClass} gap-3`}>
        {reports.map(report => {
          const Icon = report.icon
          const isSelected = selectedValues.includes(report.value)

          return (
            <div
              key={report.value}
              onClick={() => onToggle(report.value)}
              className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 w-full 
            ${
              isSelected
                ? 'border-blue-600 bg-blue-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }
            `}>
              <div className='flex items-start w-full space-x-3'>
                <div
                  className={`flex-shrink-0 p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Icon className='w-4 h-4' />
                </div>
                <div className='flex-1 min-w-0 overflow-hidden'>
                  <h3
                    className={`text-sm font-medium leading-tight truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {report.label}
                  </h3>
                  <p
                    className={`text-xs mt-1 leading-tight ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                    {report.description}
                  </p>
                </div>
              </div>
              {isSelected && (
                <div className='absolute top-2 right-2'>
                  <div className='w-2 h-2 bg-blue-600 rounded-full' />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ReportTypeSelector
