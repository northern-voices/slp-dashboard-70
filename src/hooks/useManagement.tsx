import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useOrganization } from '@/contexts/OrganizationContext'
import { School } from '@/types/database'
import { SchoolFormData } from '@/components/management/SchoolForm'

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
  const { toast } = useToast()

  const { availableSchools, refreshData, currentOrganization } = useOrganization()

  const [mockSLPs, setMockSLPs] = useState([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@district.edu',
      schools: ['Lincoln Elementary', 'Roosevelt High'],
      role: 'slp',
      status: 'active',
      lastActive: '2024-11-20',
      licenseNumber: 'SLP-12345',
    },
    {
      id: '2',
      name: 'Ms. Emily Chen',
      email: 'emily.chen@district.edu',
      schools: ['Washington Middle'],
      role: 'supervisor',
      status: 'active',
      lastActive: '2024-11-19',
      licenseNumber: 'SLP-67890',
    },
  ])

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditUser = (user: any) => {
    console.log('Edit user:', user)
  }

  const handleDeactivateUser = (userId: string) => {
    setMockSLPs(prev =>
      prev.map(user =>
        user.id === userId
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      )
    )
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
    mockSLPs,
    filteredSchools,

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
    getStatusBadge,
  }
}
