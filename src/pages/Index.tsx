import { useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import { useOrganization } from '@/contexts/OrganizationContext'
import SchoolInfoCard from '@/components/SchoolInfoCard'
import AddTeamMemberModal from '@/components/AddTeamMemberModal'
import EditSchoolDetailsModal, {
  SchoolDetailsFormData,
} from '@/components/dashboard/EditSchoolDetailsModal'
import { useSchoolDetails } from '@/hooks/school/useSchoolDetails'
import { useAvailableSLPs } from '@/hooks/school/useAvailableSLPs'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
// import DashboardStats from '@/components/DashboardStats'
// import QuickActions from '@/components/QuickActions'
// import RecentActivity from '@/components/RecentActivity'

const DashboardContent = () => {
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { userProfile, currentSchool, isLoading, currentOrganization, refreshData } =
    useOrganization()
  const queryClient = useQueryClient()

  const {
    data: schoolData,
    isLoading: isLoadingSchool,
    error: schoolError,
  } = useSchoolDetails(currentSchool)

  const { data: availableSLPs = [], isLoading: isLoadingSLPs } = useAvailableSLPs(
    currentOrganization?.id
  )

  const userRole = userProfile?.role || 'slp'
  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'Dr. Sarah Johnson'

  const handleAddMember = async (member: { name: string; roles: string[]; email: string }) => {
    if (!currentSchool) {
      console.error('No school selected')
      return
    }

    try {
      const nameParts = member.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      const { error } = await supabase.from('school_staff').insert({
        school_id: currentSchool.id,
        first_name: firstName,
        last_name: lastName,
        roles: member.roles,
        email: member.email,
        phone: null,
        is_active: true,
      })

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['school-details', currentSchool.id] })

      toast.success('Team member added successfully')
    } catch (error) {
      console.error('Error adding team member:', error)
      toast.error('Failed to add team member. Please try again.')
    }
  }

  const handleSaveSchoolDetails = async (data: SchoolDetailsFormData) => {
    if (!currentSchool) {
      toast.error('No school selected')
      return
    }

    setIsSaving(true)

    try {
      const { error } = await supabase
        .from('schools')
        .update({
          name: data.schoolName,
          phone: data.schoolPhone || null,
          primary_slp_id: data.primarySLPId,
        })
        .eq('id', currentSchool.id)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['school-edits', currentSchool.id] })
      queryClient.invalidateQueries({ queryKey: ['organization-data'] })

      await refreshData()

      toast.success('School details updated successfully')
      setIsEditModalOpen(false)
    } catch (error) {
      console.error('Error updating school details', error)
      toast.error('Failed to update school details. Please try again')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || isLoadingSchool) {
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

  if (schoolError) {
    return (
      <div className='min-h-screen flex w-full bg-gray-25'>
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <p className='text-red-600 text-sm'>Error loading school data</p>
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
                  onEdit={() => setIsEditModalOpen(true)}
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

      {currentSchool && schoolData && (
        <EditSchoolDetailsModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSave={handleSaveSchoolDetails}
          initialData={{
            schoolName: schoolData.schoolName,
            schoolPhone: schoolData.schoolPhone,
            primarySLPId: currentSchool.primary_slp_id || null,
          }}
          availableSLPs={availableSLPs}
          isSaving={isSaving}
        />
      )}
    </SidebarProvider>
  )
}

const Index = () => {
  return <DashboardContent />
}

export default Index
