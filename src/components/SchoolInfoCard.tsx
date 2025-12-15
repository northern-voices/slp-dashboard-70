import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { School, Phone, UserCircle, Users, Mail, Plus, AlertCircle } from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  roles: string[]
  email: string
}

interface PrimarySLP {
  name: string
  email: string
  phone: string
}

interface SchoolInfoCardProps {
  schoolName: string
  schoolPhone: string
  primarySLP: PrimarySLP
  schoolTeam: TeamMember[]
  onAddMember?: () => void
}

const ROLE_LABELS: Record<string, string> = {
  director: 'Director',
  sss_coordinator: 'SSS Coordinator',
  principal: 'Principal',
  vice_principal: 'Vice Principal',
  inclusive_supports_teacher: 'Inclusive Supports Teacher',
  speech_ea: 'Speech EA',
  non_designated_ea: 'Non-Designated EA',
  educator: 'Educator',
  ot: 'OT',
  slp_supplemental: 'SLP (supplemental contract)',
  pt: 'PT',
  ed_psych: 'Ed Psych',
  jp_liaison: 'JP Liaison',
  learning_support_teacher: 'Learning Support Teacher LST',
}

const getRoleLabel = (value: string): string => {
  return ROLE_LABELS[value] || value
}

const SchoolInfoCard: React.FC<SchoolInfoCardProps> = ({
  schoolName,
  schoolPhone,
  primarySLP,
  schoolTeam,
  onAddMember,
}) => {
  const hasSchoolName = schoolName && schoolName.trim() !== ''
  const hasSchoolPhone = schoolPhone && schoolPhone.trim() !== ''
  const hasPrimarySLP = primarySLP?.name && primarySLP.name !== 'Not assigned'
  const hasTeamMembers = schoolTeam && schoolTeam.length > 0

  if (!hasSchoolName && !hasSchoolPhone && !hasPrimarySLP && !hasTeamMembers) {
    return (
      <Card className='bg-white border border-gray-100 shadow-sm rounded-xl'>
        <CardHeader className='pb-4'>
          <div className='flex items-center space-x-3'>
            <div className='w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center'>
              <School className='w-4 h-4 text-brand' />
            </div>
            <div>
              <CardTitle className='text-xl font-semibold text-gray-900 tracking-tight'>
                School Information
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='flex flex-col items-center justify-center py-12 px-4'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
              <School className='w-8 h-8 text-gray-400' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>No School Selected</h3>
            <p className='text-sm text-gray-500 text-center max-w-md'>
              Please select a school from the dropdown above to view school information and team
              members.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='bg-white border border-gray-100 shadow-sm rounded-xl'>
      <CardHeader className='pb-4'>
        <div className='flex items-center space-x-3'>
          <div className='w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center'>
            <School className='w-4 h-4 text-brand' />
          </div>
          <div>
            <CardTitle className='text-xl font-semibold text-gray-900 tracking-tight'>
              School Information
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-0 space-y-6'>
        {/* School Basic Info */}
        <div className='space-y-3'>
          <div className='flex items-start space-x-3'>
            <div className='w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5'>
              <School className='w-5 h-5 text-brand' />
            </div>
            <div className='flex-1'>
              <p className='text-sm font-medium text-gray-600'>School Name</p>
              {hasSchoolName ? (
                <p className='text-base font-semibold text-gray-900 mt-1'>{schoolName}</p>
              ) : (
                <div className='flex items-center space-x-2 mt-1'>
                  <AlertCircle className='w-4 h-4 text-gray-400' />
                  <p className='text-sm text-gray-400 italic'>Not available</p>
                </div>
              )}
            </div>
          </div>

          <div className='flex items-start space-x-3'>
            <div className='w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5'>
              <Phone className='w-5 h-5 text-emerald-600' />
            </div>
            <div className='flex-1'>
              <p className='text-sm font-medium text-gray-600'>Phone Number</p>
              {hasSchoolPhone ? (
                <p className='text-base font-semibold text-gray-900 mt-1'>{schoolPhone}</p>
              ) : (
                <div className='flex items-center space-x-2 mt-1'>
                  <AlertCircle className='w-4 h-4 text-gray-400' />
                  <p className='text-sm text-gray-400 italic'>Not available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Primary SLP */}
        <div className='pt-3 border-t border-gray-100'>
          <div className='flex items-start space-x-3'>
            <div className='w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5'>
              <UserCircle className='w-5 h-5 text-indigo-600' />
            </div>
            <div className='flex-1'>
              <p className='text-sm font-medium text-gray-600 mb-2'>Primary SLP</p>
              {hasPrimarySLP ? (
                <div className='bg-gray-50 rounded-lg p-3 space-y-1.5'>
                  <p className='text-base font-semibold text-gray-900'>{primarySLP.name}</p>
                  <div className='flex items-center space-x-2 text-sm text-gray-600'>
                    <Mail className='w-3.5 h-3.5' />
                    <span>{primarySLP.email || 'No email'}</span>
                  </div>
                  <div className='flex items-center space-x-2 text-sm text-gray-600'>
                    <Phone className='w-3.5 h-3.5' />
                    <span>{primarySLP.phone || 'No phone'}</span>
                  </div>
                </div>
              ) : (
                <div className='bg-amber-50 border border-amber-100 rounded-lg p-4'>
                  <div className='flex items-start space-x-3'>
                    <AlertCircle className='w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5' />
                    <div>
                      <p className='text-sm font-medium text-amber-900'>No Primary SLP Assigned</p>
                      <p className='text-xs text-amber-700 mt-1'>
                        Contact your administrator to assign a primary SLP to this school.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* School Team */}
        <div className='pt-3 border-t border-gray-100'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-start space-x-3'>
              <div className='w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0'>
                <Users className='w-5 h-5 text-purple-600' />
              </div>
              <div>
                <p className='text-sm font-medium text-gray-600'>School Team</p>
                <p className='text-xs text-gray-500 mt-0.5'>{schoolTeam.length} members</p>
              </div>
            </div>

            <Button
              onClick={onAddMember}
              size='sm'
              className='bg-brand hover:bg-brand/90 text-white h-8 px-3 rounded-lg text-xs font-medium'>
              <div className='flex items-center space-x-1.5'>
                <Plus className='w-3.5 h-3.5' />
                <span className='leading-none'>Add Member</span>
              </div>
            </Button>
          </div>

          {hasTeamMembers ? (
            <div className='space-y-2'>
              {schoolTeam.map(member => (
                <div
                  key={member.id}
                  className='bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-150'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <p className='text-sm font-semibold text-gray-900'>{member.name}</p>
                      <div className='flex flex-wrap gap-1 mt-1.5'>
                        {member.roles.map((roleValue, index) => (
                          <span
                            key={index}
                            className='inline-block px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-xs font-medium'>
                            {getRoleLabel(roleValue)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2 text-xs text-gray-500 mt-2'>
                    <Mail className='w-3 h-3' />
                    <span>{member.email}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6'>
              <div className='flex flex-col items-center justify-center text-center'>
                <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                  <Users className='w-6 h-6 text-gray-400' />
                </div>
                <h4 className='text-sm font-semibold text-gray-900 mb-1'>No Team Members Yet</h4>
                <p className='text-xs text-gray-500 mb-4 max-w-xs'>
                  Get started by adding your first team member to this school.
                </p>
                <Button
                  onClick={onAddMember}
                  size='sm'
                  variant='outline'
                  className='border-gray-300 hover:bg-gray-50 text-gray-700 h-8 px-4 rounded-lg text-xs font-medium'>
                  <div className='flex items-center space-x-1.5'>
                    <Plus className='w-3.5 h-3.5' />
                    <span>Add First Member</span>
                  </div>
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SchoolInfoCard
