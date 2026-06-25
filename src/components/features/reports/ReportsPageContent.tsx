import { User, Ear, Building2, Target, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ElementType } from 'react'

type ColorKey = 'purple' | 'blue' | 'orange'

const colorStyles: Record<
  ColorKey,
  {
    dot: string
    iconBg: string
    iconText: string
    schoolIconBg: string
    schoolIconText: string
    badge: string
  }
> = {
  purple: {
    dot: 'bg-purple-500',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
    schoolIconBg: 'bg-purple-50',
    schoolIconText: 'text-purple-400',
    badge: 'bg-purple-100 text-purple-700',
  },
  blue: {
    dot: 'bg-blue-500',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    schoolIconBg: 'bg-blue-50',
    schoolIconText: 'text-blue-400',
    badge: 'bg-blue-100 text-blue-700',
  },
  orange: {
    dot: 'bg-orange-500',
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-600',
    schoolIconBg: 'bg-orange-50',
    schoolIconText: 'text-orange-400',
    badge: 'bg-orange-100 text-orange-700',
  },
}

const sections: {
  label: string
  color: ColorKey
  individual: { description: string; route: string; Icon: ElementType }
  schoolWide: { description: string; route: string }
}[] = [
  {
    label: 'Speech Reports',
    color: 'purple',
    individual: {
      description: 'Generate a speech screening report for a specific student',
      route: 'speech',
      Icon: User,
    },
    schoolWide: {
      description: 'Aggregate speech screening results across all students',
      route: 'school-wide-speech',
    },
  },
  {
    label: 'Hearing Reports',
    color: 'blue',
    individual: {
      description: 'Generate a hearing screening report for a specific student',
      route: 'hearing',
      Icon: Ear,
    },
    schoolWide: {
      description: 'Aggregate hearing screening results across all students',
      route: 'school-wide-hearing',
    },
  },
  {
    label: 'Goal Sheets',
    color: 'orange',
    individual: {
      description: 'Print or export goal sheets for a specific student',
      route: 'goal-sheets',
      Icon: Target,
    },
    schoolWide: {
      description: 'Export combined goal sheets for all students',
      route: 'school-wide-goal-sheets',
    },
  },
]

const ReportsPageContent = () => {
  const navigate = useNavigate()

  return (
    <div className='w-full min-h-screen overflow-hidden'>
      <div className='pb-8 space-y-8'>
        <h1 className='text-xl font-semibold text-gray-900 sm:text-2xl lg:text-3xl'>Reports</h1>

        <div className='space-y-8'>
          {sections.map(({ label, color, individual, schoolWide }) => {
            const style = colorStyles[color]

            return (
              <div key={label} className='space-y-3'>
                {/* Section Header */}
                <div className='flex items-center gap-2'>
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${style.dot}`} />
                  <h2 className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                    {label}
                  </h2>
                </div>

                <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6'>
                  {/* Individual Card */}
                  <button
                    type='button'
                    onClick={() => navigate(individual.route)}
                    className='text-left bg-white border border-gray-100 shadow-sm rounded-xl p-5 hover:shadow-md hover:border-gray-200 transition-all group'>
                    <div className='flex items-start gap-4'>
                      <div
                        className={`flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-lg ${style.iconBg}`}>
                        <individual.Icon className={`w-5 h-5 ${style.iconText}`} />
                      </div>

                      <div className='flex-1 min-w-0'>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-1.5 ${style.badge}`}>
                          <User className='w-3 h-3' />
                          Individual
                        </span>

                        <p className='text-sm font-semibold text-gray-900'>{label}</p>
                        <p className='text-xs text-gray-500 mt-0.5'>{individual.description}</p>
                      </div>
                      <ChevronRight className='w-4 h-4 text-gray-300 flex-shrink-0 mt-1 group-hover:text-gray-500 transition-colors' />
                    </div>
                  </button>

                  {/* School-wide Card */}
                  <button
                    type='button'
                    onClick={() => navigate(schoolWide.route)}
                    className='text-left bg-white border border-gray-100 shadow-sm rounded-xl p-5 hover:shadow-md hover:border-gray-200 transition-all group'>
                    <div className='flex items-start gap-4'>
                      <div
                        className={`flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-lg ${style.schoolIconBg}`}>
                        <Building2 className={`w-5 h-5 ${style.schoolIconText}`} />
                      </div>

                      <div className='flex-1 min-w-0'>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-1.5 ${style.badge}`}>
                          <Building2 className='w-3 h-3' />
                          School-wide
                        </span>

                        <p className='text-sm font-semibold text-gray-900'>{label}</p>
                        <p className='text-xs text-gray-500 mt-0.5'>{schoolWide.description}</p>
                      </div>

                      <ChevronRight className='w-4 h-4 text-gray-300 flex-shrink-0 mt-1 group-hover:text-gray-500 transition-colors' />
                    </div>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ReportsPageContent
