import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useOrganization } from '@/contexts/OrganizationContext'
import { School } from '@/types/database'
import { SchoolFormData } from '@/components/management/SchoolForm'
import { OrgUser } from '@/types/database'
import { UserEditFormData } from '@/components/management/UserEditModal'

export const useManagement = () => {
  const [schoolFormOpen, setSchoolFormOpen] = useState(false)
  const [schoolDetailsOpen, setSchoolDetailsOpen] = useState(false)
  const [userInviteOpen, setUserInviteOpen] = useState(false)
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false)
  const [screeningTemplatesOpen, setScreeningTemplatesOpen] = useState(false)
  const [organizationSettingsOpen, setOrganizationSettingsOpen] = useState(false)
  const [editingSchool, setEditingSchool] = useState<School | null>(null)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [schoolSearch, setSchoolSearch] = useState('')
  const [users, setUsers] = useState<OrgUser[]>([])
  const [editingUser, setEditingUser] = useState<OrgUser | null>(null)
  const [userEditOpen, setUserEditOpen] = useState(false)

  const { toast } = useToast()

  const { availableSchools, refreshData, currentOrganization } = useOrganization()

  useEffect(() => {
    if (!currentOrganization?.id) return

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*, schools(id, name)')
        .eq('organization_id', currentOrganization.id)
        .order('first_name')

      if (error) {
        toast({ title: 'Failed to load users', description: error.message, variant: 'destructive' })
        return
      }

      setUsers(data || [])
    }

    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrganization?.id])

  const filteredSchools = availableSchools.filter(school =>
    school.name.toLowerCase().includes(schoolSearch.toLowerCase())
  )

  const handleSaveSchool = async (schoolData: SchoolFormData) => {
    const payload = {
      name: schoolData.name,
      street_address: schoolData.address,
      city: schoolData.city,
      region: schoolData.state,
      postal_code: schoolData.zip,
      principal_name: schoolData.principal_name,
      principal_email: schoolData.principal_email,
      phone: schoolData.phone,
    }

    if (editingSchool) {
      const { error } = await supabase.from('schools').update(payload).eq('id', editingSchool.id)
      if (error) {
        toast({
          title: 'Failed to update school',
          description: error.message,
          variant: 'destructive',
        })
        return
      }
      toast({ title: 'School updated successfully' })
    } else {
      const { error } = await supabase
        .from('schools')
        .insert({ ...payload, organization_id: currentOrganization?.id })
      if (error) {
        toast({
          title: 'Failed to create school',
          description: error.message,
          variant: 'destructive',
        })
        return
      }
      toast({ title: 'School created successfully' })
    }

    await refreshData()
    setEditingSchool(null)
  }

  const handleEditSchool = (school: School) => {
    setEditingSchool(school)
    setSchoolFormOpen(true)
  }

  const handleViewSchoolDetails = (school: School) => {
    setSelectedSchool(school)
    setSchoolDetailsOpen(true)
  }

  const handleEditFromDetails = (school: School) => {
    setSchoolDetailsOpen(false)
    setEditingSchool(school)
    setSchoolFormOpen(true)
  }

  const handleDeleteSchool = async (schoolId: string) => {
    const schoolToDelete = availableSchools.find(school => school.id === schoolId)
    const { error } = await supabase.from('schools').delete().eq('id', schoolId)
    if (error) {
      toast({
        title: 'Failed to delete school',
        description: error.message,
        variant: 'destructive',
      })
      return
    }
    await refreshData()
    toast({
      title: 'School deleted',
      description: `${schoolToDelete?.name} has been successfully deleted.`,
      variant: 'destructive',
    })
  }

  const handleInviteUser = () => {
    // Will refresh the real users list here once we replace mockSLPs with a query
  }

  const handleEditUser = (user: OrgUser) => {
    setEditingUser(user)
    setUserEditOpen(true)
  }

  const handleSaveUser = async (userId: string, data: UserEditFormData) => {
    const { error } = await supabase
      .from('users')
      .update({ first_name: data.first_name, last_name: data.last_name, role: data.role })
      .eq('id', userId)

    if (error) {
      toast({ title: 'Failed to update user', description: error.message, variant: 'destructive' })
      return
    }

    toast({ title: 'User updated successfully' })
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...data } : u)))
  }

  const handleDeactivateUser = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    const { error } = await supabase
      .from('users')
      .update({ is_active: !user?.is_active })
      .eq('id', userId)

    if (error) {
      toast({
        title: 'Failed to update user',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, is_active: !u.is_active } : u)))
  }

  const handleResendInvite = (userId: string) => {
    console.log('Resend invite to user:', userId)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className='text-green-800 bg-green-100'>Active</Badge>
      case 'inactive':
        return <Badge variant='outline'>Inactive</Badge>
      default:
        return <Badge variant='secondary'>{status}</Badge>
    }
  }

  return {
    // State
    schoolFormOpen,
    schoolDetailsOpen,
    userInviteOpen,
    notificationSettingsOpen,
    screeningTemplatesOpen,
    organizationSettingsOpen,
    editingSchool,
    selectedSchool,
    schoolSearch,
    users,
    filteredSchools,
    editingUser,
    userEditOpen,

    // Setters
    setSchoolFormOpen,
    setSchoolDetailsOpen,
    setUserInviteOpen,
    setNotificationSettingsOpen,
    setScreeningTemplatesOpen,
    setOrganizationSettingsOpen,
    setEditingSchool,
    setSelectedSchool,
    setSchoolSearch,
    setUserEditOpen,
    setEditingUser,

    // Handlers
    handleSaveSchool,
    handleEditSchool,
    handleViewSchoolDetails,
    handleEditFromDetails,
    handleDeleteSchool,
    handleInviteUser,
    handleEditUser,
    handleDeactivateUser,
    handleResendInvite,
    handleSaveUser,
  }
}
