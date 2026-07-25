import { useState } from 'react'
import { Activity, School } from '@/types/database'
import { useOrganization } from '@/contexts/OrganizationContext'
import SchoolInfoCard from '@/components/SchoolInfoCard'
import AddTeamMemberModal from '@/components/AddTeamMemberModal'
import EditTeamMemberModal from '@/components/EditTeamMemberModal'
import { useSchoolActivities } from '@/hooks/school/useSchoolActivities'
import ActivityLogCard from '@/components/dashboard/ActivityLogCard'
import AddActivityModal from '@/components/dashboard/AddActivityModal'
import EditSchoolDetailsModal, {
  SchoolDetailsFormData,
} from '@/components/dashboard/EditSchoolDetailsModal'
import { useSchoolDetails } from '@/hooks/school/useSchoolDetails'
import { useAvailableSLPs } from '@/hooks/school/useAvailableSLPs'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton'
import EditPrimarySLPModal from '@/components/dashboard/EditPrimarySLPModal'
import { getSchoolYear, getRecentSchoolYears } from '@/utils/dateUtils'
// import DashboardStats from '@/components/DashboardStats'
// import QuickActions from '@/components/QuickActions'
// import RecentActivity from '@/components/RecentActivity'

const DashboardContent = () => {
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<{
    id: string
    name: string
    roles: string[]
    email: string
    phone: string
  } | null>(null)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false)
  const [isEditSLPModalOpen, setIsEditSLPModalOpen] = useState(false)
  const [isSavingSLP, setIsSavingSLP] = useState(false)
  const [selectedYear, setSelectedYear] = useState(() => getSchoolYear())

  const availableYears = getRecentSchoolYears(2)

  const {
    userProfile,
    currentSchool,
    isLoading,
    currentOrganization,
    refreshData,
    setCurrentSchool,
  } = useOrganization()
  const queryClient = useQueryClient()

  const {
    data: schoolData,
    isLoading: isLoadingSchool,
    error: schoolError,
  } = useSchoolDetails(currentSchool)

  const { data: availableSLPs = [], isLoading: isLoadingSLPs } = useAvailableSLPs(
    currentOrganization?.id
  )

  const { data: activities = [], isLoading: isLoadingActivities } = useSchoolActivities(
    currentSchool,
    selectedYear
  )

  const userRole = userProfile?.role || 'slp'
  const canEditSchoolDetails = userRole === 'super_admin'

  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'Dr. Sarah Johnson'

  const handleAddMember = async (member: {
    name: string
    roles: string[]
    email: string
    phone: string
  }) => {
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
        phone: member.phone,
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
    if (!canEditSchoolDetails) {
      toast.error('Only admins can edit school details')
      return
    }

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

      // Fetch the fresh school data
      const { data: updatedSchoolData, error: fetchError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', currentSchool.id)
        .single()

      if (fetchError) throw fetchError

      // update currentSchool
      if (updatedSchoolData) {
        const updatedSchool: School = {
          id: updatedSchoolData.id,
          organization_id: updatedSchoolData.organization_id,
          name: updatedSchoolData.name,
          address: updatedSchoolData.street_address,
          city: updatedSchoolData.city,
          state: updatedSchoolData.region || '',
          zip: updatedSchoolData.postal_code || '',
          principal_name: updatedSchoolData.principal_name || '',
          principal_email: updatedSchoolData.principal_email || '',
          phone: updatedSchoolData.phone || '',
          primary_slp_id: updatedSchoolData.primary_slp_id || null,
          created_at: updatedSchoolData.created_at,
          updated_at: updatedSchoolData.updated_at,
        }
        setCurrentSchool(updatedSchool)
      }

      // Wait a bit for React to re-render with the new currentSchool then invalidate and refetch
      await new Promise(resolve => setTimeout(resolve, 100))
      await queryClient.invalidateQueries({ queryKey: ['school-details', currentSchool.id] })

      toast.success('School details updated successfully')
      setIsEditModalOpen(false)
    } catch (error) {
      console.error('Error updating school details', error)
      toast.error('Failed to update school details. Please try again')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePrimarySLP = async (data: {
    firstName: string
    lastName: string
    email: string
  }) => {
    if (!currentSchool?.primary_slp_id) return

    setIsSavingSLP(true)

    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
        })
        .eq('id', currentSchool.primary_slp_id)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['school-details', currentSchool.id] })
      toast.success('Primary SLP updated successfully')
      setIsEditSLPModalOpen(false)
    } catch (error) {
      console.error('Error updating primary SLP:', error)
      toast.error('Failed to update primary SLP. Please try again.')
    } finally {
      setIsSavingSLP(false)
    }
  }

  const handleEditMember = (member: {
    id: string
    name: string
    roles: string[]
    email: string
    phone: string
  }) => {
    setEditingMember(member)
    setIsEditMemberModalOpen(true)
  }

  const handleUpdateMember = async (member: {
    id: string
    name: string
    roles: string[]
    email: string
  }) => {
    if (!currentSchool) {
      console.error('No school selected')
      return
    }

    try {
      const nameParts = member.name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      const { error } = await supabase
        .from('school_staff')
        .update({
          first_name: firstName,
          last_name: lastName,
          roles: member.roles,
          email: member.email,
        })
        .eq('id', member.id)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['school-details', currentSchool.id] })

      toast.success('Team member updated successfully')
    } catch (error) {
      console.error('Error updating team member:', error)
      toast.error('Failed to update team member. Please try again.')
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!currentSchool) {
      console.error('No school selected')
      return
    }

    try {
      const { error } = await supabase.from('school_staff').delete().eq('id', memberId)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['school-details', currentSchool.id] })

      toast.success('Team member removed successfully')
    } catch (error) {
      console.error('Error deleting team member:', error)
      toast.error('Failed to remove team member. Please try again.')
    }
  }

  const handleAddActivity = async (activity: {
    activity_type: string
    activity_date: string
    notes: string
  }) => {
    if (!currentSchool || !userProfile) {
      console.error('No school or user selected')
      return
    }

    try {
      const { error } = await supabase.from('school_activities').insert({
        school_id: currentSchool.id,
        activity_type: activity.activity_type,
        activity_date: activity.activity_date,
        notes: activity.notes || null,
        created_by: userProfile.id,
      })

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['school-activities', currentSchool.id] })

      toast.success('Activity added successfully')
    } catch (error) {
      console.error('Error adding activity:', error)
      toast.error('Failed to add activity. Please try again.')
    }
  }

  const handleDeleteActivity = async (activityId: string) => {
    if (!currentSchool) {
      console.error('No school selected')
      return
    }

    try {
      const { error } = await supabase.from('school_activities').delete().eq('id', activityId)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['school-activities', currentSchool.id] })

      toast.success('Activity removed successfully')
    } catch (error) {
      console.error('Error deleting activity:', error)
      toast.error('Failed to remove activity. Please try again.')
    }
  }

  const handleEditActivity = async (
    activityId: string,
    updates: Partial<Pick<Activity, 'activity_type' | 'activity_date' | 'notes'>>
  ) => {
    if (!currentSchool) {
      console.error('No school selected')
      return
    }

    try {
      const { error } = await supabase
        .from('school_activities')
        .update(updates)
        .eq('id', activityId)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['school-activities', currentSchool.id] })

      toast.success('Activity updated successfully')
    } catch (error) {
      console.error('Error updating activity:', error)
      toast.error('Failed to update activity. Please try again.')
    }
  }

  if (isLoading || isLoadingSchool || !schoolData) {
    return <DashboardSkeleton />
  }

  if (schoolError) {
    return (
      <div className='flex items-center justify-center flex-1'>
        <p className='text-sm text-red-600'>Error loading school data</p>
      </div>
    )
  }

  return (
    <>
      {/* Page Header */}
      <div className='mb-8'>
        <h1 className='mb-2 text-2xl font-semibold tracking-tight text-gray-900'>
          {userRole === 'slp'
            ? 'My Dashboard'
            : currentSchool
              ? `${currentSchool.name} Dashboard`
              : 'Dashboard'}
        </h1>
        <p className='text-sm leading-relaxed text-gray-600'>
          Welcome back, {userName}.
          {userRole === 'slp'
            ? ' Select a school and start managing screenings.'
            : ' Start new assessments and manage your speech & language screenings.'}
        </p>
      </div>

      {/* Dashboard Content */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8'>
        <SchoolInfoCard
          schoolName={schoolData.schoolName}
          schoolPhone={schoolData.schoolPhone}
          primarySLP={schoolData.primarySLP}
          schoolTeam={schoolData.schoolTeam}
          onAddMember={() => setIsAddMemberModalOpen(true)}
          onEdit={() => setIsEditModalOpen(true)}
          onEditMember={handleEditMember}
          onDeleteMember={handleDeleteMember}
          onEditPrimarySLP={canEditSchoolDetails ? () => setIsEditSLPModalOpen(true) : undefined}
        />

        <ActivityLogCard
          activities={activities}
          selectedYear={selectedYear}
          availableYears={availableYears}
          onYearChange={setSelectedYear}
          onAddActivity={() => setIsAddActivityModalOpen(true)}
          onDeleteActivity={handleDeleteActivity}
          onEditActivity={handleEditActivity}
        />

        {/* <QuickActions />
                <DashboardStats />
                <RecentActivity /> */}
      </div>

      {/* Modals */}
      <AddTeamMemberModal
        open={isAddMemberModalOpen}
        onOpenChange={setIsAddMemberModalOpen}
        onAddMember={handleAddMember}
      />

      <EditTeamMemberModal
        open={isEditMemberModalOpen}
        onOpenChange={setIsEditMemberModalOpen}
        onUpdateMember={handleUpdateMember}
        member={editingMember}
      />

      <AddActivityModal
        open={isAddActivityModalOpen}
        onOpenChange={setIsAddActivityModalOpen}
        onAddActivity={handleAddActivity}
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

      {currentSchool?.primary_slp_id && schoolData && (
        <EditPrimarySLPModal
          open={isEditSLPModalOpen}
          onOpenChange={setIsEditSLPModalOpen}
          onSave={handleSavePrimarySLP}
          initialData={{
            firstName: schoolData.primarySLP.name.split(' ')[0] || '',
            lastName: schoolData.primarySLP.name.split(' ').slice(1).join(' ') || '',
            email: schoolData.primarySLP.email,
          }}
          isSaving={isSavingSLP}
        />
      )}
    </>
  )
}

const Index = () => {
  return <DashboardContent />
}

export default Index
