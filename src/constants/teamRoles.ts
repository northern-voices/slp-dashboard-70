export interface TeamRole {
  value: string
  label: string
}

export const TEAM_MEMBER_ROLES: TeamRole[] = [
  { value: 'superintendent', label: 'Superintendent' },
  { value: 'director', label: 'Director' },
  { value: 'sss_coordinator', label: 'SSS Coordinator' },
  { value: 'principal', label: 'Principal' },
  { value: 'vice_principal', label: 'Vice Principal' },
  { value: 'inclusive_supports_teacher', label: 'Inclusive Supports Teacher' },
  { value: 'speech_ea', label: 'Speech EA' },
  { value: 'non_designated_ea', label: 'Non-Designated EA' },
  { value: 'educator', label: 'Educator' },
  { value: 'ot', label: 'OT' },
  { value: 'slp_supplemental', label: 'SLP (supplemental contract)' },
  { value: 'pt', label: 'PT' },
  { value: 'ed_psych', label: 'Ed Psych' },
  { value: 'jp_liaison', label: 'JP Liaison' },
  { value: 'learning_support_teacher', label: 'Learning Support Teacher LST' },
  { value: 'resource_teacher', label: 'Resource Teacher' },
  { value: 'social_emotional', label: 'Social/Emotional' },
  { value: 'headstart_teacher', label: 'Headstart Teacher' },
]

export const getTeamRoleLabel = (value: string): string => {
  const role = TEAM_MEMBER_ROLES.find(r => r.value === value)
  return role ? role.label : value
}
