import { useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import { useOrganization } from '@/contexts/OrganizationContext'
import SchoolInfoCard from '@/components/SchoolInfoCard'
import AddTeamMemberModal from '@/components/AddTeamMemberModal'

// import DashboardStats from '@/components/DashboardStats'
// import QuickActions from '@/components/QuickActions'
// import RecentActivity from '@/components/RecentActivity'

const DashboardContent = () => {
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const { userProfile, currentSchool, isLoading } = useOrganization()

  const userRole = userProfile?.role || 'slp'
  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'Dr. Sarah Johnson'

  const [schoolData, setSchoolData] = useState({
    schoolName: 'Northern Voices Elementary',
    schoolPhone: '(907) 555-0123',
    primarySLP: {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@nvschools.edu',
      phone: '(907) 555-0124',
    },
    schoolTeam: [
      {
        id: 1,
        name: 'Emily Carter',
        roles: ['educator', 'speech_ea'],
        email: 'emily.carter@nvschools.edu',
      },
      {
        id: 2,
        name: 'Michael Rodriguez',
        roles: ['ot'],
        email: 'michael.rodriguez@nvschools.edu',
      },
      {
        id: 3,
        name: 'Jennifer Lee',
        roles: ['sss_coordinator', 'inclusive_supports_teacher'],
        email: 'jennifer.lee@nvschools.edu',
      },
      {
        id: 4,
        name: 'David Thompson',
        roles: ['speech_ea'],
        email: 'david.thompson@nvschools.edu',
      },
    ],
  })

  const handleAddMember = (member: { name: string; roles: string[]; email: string }) => {
    const newMember = {
      id: schoolData.schoolTeam.length + 1,
      ...member,
    }

    setSchoolData(prev => ({
      ...prev,
      schoolTeam: [...prev.schoolTeam, newMember],
    }))
  }

  if (isLoading) {
    return (
      <div className='min-h-screen flex w-full bg-gray-25'>
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-4'></div>
            <p className='text-gray-600 text-sm'>Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className='min-h-screen flex w-full bg-gray-25'>
        <AppSidebar userRole={userRole} userName={userName} />

        <SidebarInset className='flex-1'>
          <Header userRole={userRole} userName={userName} />

          <main className='flex-1 px-6 py-8 pb-8'>
            {/* Page Header */}
            <div className='mb-8'>
              <div className='max-w-7xl mx-auto'>
                <h1 className='text-2xl font-semibold text-gray-900 tracking-tight mb-2'>
                  {userRole === 'slp'
                    ? 'My Dashboard'
                    : currentSchool
                    ? `${currentSchool.name} Dashboard`
                    : 'Dashboard'}
                </h1>
                <p className='text-gray-600 text-sm leading-relaxed'>
                  Welcome back, {userName}.
                  {userRole === 'slp'
                    ? ' Select a school and start managing screenings.'
                    : ' Start new assessments and manage your speech & language screenings.'}
                </p>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className='max-w-7xl mx-auto'>
              <div className='space-y-8'>
                <SchoolInfoCard
                  schoolName={schoolData.schoolName}
                  schoolPhone={schoolData.schoolPhone}
                  primarySLP={schoolData.primarySLP}
                  schoolTeam={schoolData.schoolTeam}
                  onAddMember={() => setIsAddMemberModalOpen(true)}
                />

                {/* <QuickActions />
                <DashboardStats />
                <RecentActivity /> */}
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>

      <AddTeamMemberModal
        open={isAddMemberModalOpen}
        onOpenChange={setIsAddMemberModalOpen}
        onAddMember={handleAddMember}
      />
    </SidebarProvider>
  )
}

const Index = () => {
  return <DashboardContent />
}

export default Index
