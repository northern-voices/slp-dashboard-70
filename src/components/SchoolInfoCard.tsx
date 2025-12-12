import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { School, Phone, UserCircle, Users, Mail, Plus } from 'lucide-react'

interface TeamMember {
  id: number
  name: string
  role: string
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

const SchoolInfoCard: React.FC<SchoolInfoCardProps> = ({
  schoolName,
  schoolPhone,
  primarySLP,
  schoolTeam,
  onAddMember,
}) => {
  return (
    <Card className='bg-white border border-gray-100 shadow-sm rounded-xl'>
      <CardHeader className='pb-4'>
        <div className='flex items-center space-x-3'>
          <div className='w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center'>
            <School className='w-4 h-4 text-brand' />
          </div>
          <div>
            <CardTitle className='text-lg font-semibold text-gray-900 tracking-tight'>
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
            <div>
              <p className='text-sm font-medium text-gray-600'>School Name</p>
              <p className='text-base font-semibold text-gray-900 mt-1'>{schoolName}</p>
            </div>
          </div>

          <div className='flex items-start space-x-3'>
            <div className='w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5'>
              <Phone className='w-5 h-5 text-emerald-600' />
            </div>
            <div>
              <p className='text-sm font-medium text-gray-600'>Phone Number</p>
              <p className='text-base font-semibold text-gray-900 mt-1'>{schoolPhone}</p>
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
              <div className='bg-gray-50 rounded-lg p-3 space-y-1.5'>
                <p className='text-base font-semibold text-gray-900'>{primarySLP.name}</p>
                <div className='flex items-center space-x-2 text-sm text-gray-600'>
                  <Mail className='w-3.5 h-3.5' />
                  <span>{primarySLP.email}</span>
                </div>
                <div className='flex items-center space-x-2 text-sm text-gray-600'>
                  <Phone className='w-3.5 h-3.5' />
                  <span>{primarySLP.phone}</span>
                </div>
              </div>
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

          <div className='space-y-2'>
            {schoolTeam.map(member => (
              <div
                key={member.id}
                className='bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-150'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <p className='text-sm font-semibold text-gray-900'>{member.name}</p>
                    <p className='text-xs text-gray-600 mt-0.5'>{member.role}</p>
                  </div>
                </div>
                <div className='flex items-center space-x-2 text-xs text-gray-500 mt-2'>
                  <Mail className='w-3 h-3' />
                  <span>{member.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SchoolInfoCard
