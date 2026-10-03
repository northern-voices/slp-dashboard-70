import type { LastScreeningInfo } from '@/api/students'

export function withDuplicateLabels<
  T extends { id: string; first_name: string; last_name: string; created_at: string },
>(students: T[]): Array<T & { duplicateLabel: string | null }> {
  const groups = new Map<string, T[]>()

  for (const student of students) {
    const key = `${student.first_name.trim().toLowerCase()}|${student.last_name.trim().toLowerCase()}`
    const group = groups.get(key) ?? []
    group.push(student)
    groups.set(key, group)
  }

  const labelById = new Map<string, string>()

  for (const group of groups.values()) {
    if (group.length < 2) continue // no collision, no label

    const sorted = [...group].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    sorted.forEach((student, index) => {
      labelById.set(student.id, String.fromCharCode(65 + index)) // 'A', 'B', 'C'...
    })
  }

  return students.map(student => ({
    ...student,
    duplicateLabel: labelById.get(student.id) ?? null,
  }))
}

export function formatScreeningInfo(info?: LastScreeningInfo): string {
  if (!info) return 'No screenings yet'
  const date = new Date(info.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  if (info.grade && info.academicYear) {
    return `Last screen: ${date} — ${info.grade} - ${info.academicYear}`
  }

  return info.grade ? `Last screen: ${date} — ${info.grade}` : `Last screen: ${date}`
}
