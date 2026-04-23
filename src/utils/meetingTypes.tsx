export const MEETING_TYPE_STYLES: Record<string, { label: string; className: string }> = {
  progress_checkin: {
    label: 'Progress Check-in',
    className: 'bg-blue-100 text-blue-800',
  },
  coaching_call: {
    label: 'Coaching Call',
    className: 'bg-purple-100 text-purple-800',
  },
  school_visit_summary: {
    label: 'School Visit Summary',
    className: 'bg-green-100 text-green-800',
  },
}

export const MeetingTypeBadge = ({ type }: { type: string | null }) => {
  if (!type) return <span className='text-gray-400 text-sm'>—</span>
  const style = MEETING_TYPE_STYLES[type] ?? { label: type, className: 'bg-gray-100 text-gray-700' }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style.className}`}>
      {style.label}
    </span>
  )
}
