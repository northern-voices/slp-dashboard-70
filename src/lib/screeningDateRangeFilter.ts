import { getCurrentAcademicYearStartDate, getAcademicYearRange } from './academicYear'

export const matchesDateRangeFilter = (date: Date, dateRangeFilter: string): boolean => {
  if (dateRangeFilter === 'all') return true

  const now = new Date()

  if (dateRangeFilter === 'today') {
    return date.toDateString() === now.toDateString()
  }

  if (dateRangeFilter === 'week') {
    const weekAgo = new Date(now)
    weekAgo.setDate(now.getDate() - 7)
    return date >= weekAgo
  }

  if (dateRangeFilter === 'month') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }

  if (dateRangeFilter === 'quarter') {
    const quarterAgo = new Date(now)
    quarterAgo.setMonth(now.getMonth() - 3)
    return date >= quarterAgo
  }

  if (dateRangeFilter === 'school_year') {
    return date >= getCurrentAcademicYearStartDate()
  }

  if (dateRangeFilter.startsWith('sy_')) {
    const { start, end } = getAcademicYearRange(dateRangeFilter.replace('sy_', ''))
    return date >= start && date <= end
  }

  return true
}
