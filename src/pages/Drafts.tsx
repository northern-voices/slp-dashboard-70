import React, { useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import DraftsList from '@/components/drafts/DraftsList'
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext'
import { Draft } from '@/types/draft'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

// Mock drafts data - replace with actual API call
const mockDrafts: Draft[] = [
  {
    id: '1',
    user_id: 'user1',
    student_id: 'student1',
    screening_type: 'speech',
    title: 'Speech Screening - John Doe',
    form_data: {},
    completion_percentage: 65,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T14:30:00Z',
    student_name: 'John Doe',
    user_name: 'Dr. Sarah Johnson',
  },
  {
    id: '2',
    user_id: 'user2',
    student_id: 'student2',
    screening_type: 'hearing',
    title: 'Hearing Screening - Jane Smith',
    form_data: {},
    completion_percentage: 30,
    created_at: '2024-01-14T09:00:00Z',
    updated_at: '2024-01-14T11:15:00Z',
    student_name: 'Jane Smith',
    user_name: 'Dr. Mike Wilson',
  },
  {
    id: '3',
    user_id: 'user1',
    screening_type: 'speech',
    title: 'New Speech Screening Draft',
    form_data: {},
    completion_percentage: 15,
    created_at: '2024-01-16T08:00:00Z',
    updated_at: '2024-01-16T08:30:00Z',
    user_name: 'Dr. Sarah Johnson',
  },
]
const DraftsContent = () => {
  const { userProfile } = useOrganization()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [drafts, setDrafts] = useState<Draft[]>(mockDrafts)
  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'Dr. Sarah Johnson'
  const userRole = userProfile?.role || 'slp'
  const currentUserId = userProfile?.id || 'user1'
  const handleBack = () => {
    // Go back to the previous page in browser history
    window.history.back()
  }
  const handleView = (draft: Draft) => {
    console.log('Viewing draft:', draft)
    // Navigate to screening page with draft data
    const route =
      draft.screening_type === 'speech'
        ? `/screening/speech${draft.student_id ? `/${draft.student_id}` : ''}?draft=${draft.id}`
        : `/screening/hearing${draft.student_id ? `/${draft.student_id}` : ''}?draft=${draft.id}`
    navigate(route)
  }
  const handleEdit = (draft: Draft) => {
    console.log('Editing draft:', draft)
    const route =
      draft.screening_type === 'speech'
        ? `/screening/speech${draft.student_id ? `/${draft.student_id}` : ''}?draft=${
            draft.id
          }&edit=true`
        : `/screening/hearing${draft.student_id ? `/${draft.student_id}` : ''}?draft=${
            draft.id
          }&edit=true`
    navigate(route)
  }
  const handleDelete = (draft: Draft) => {
    console.log('Deleting draft:', draft)
    if (
      window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')
    ) {
      setDrafts(prev => prev.filter(d => d.id !== draft.id))
      toast({
        title: 'Draft deleted',
        description: 'The draft has been successfully deleted.',
      })
    }
  }
  const handleDuplicate = (draft: Draft) => {
    console.log('Duplicating draft:', draft)
    const newDraft: Draft = {
      ...draft,
      id: `${draft.id}_copy_${Date.now()}`,
      title: `${draft.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completion_percentage: 0,
      user_id: currentUserId,
      user_name: userName,
    }
    setDrafts(prev => [newDraft, ...prev])
    toast({
      title: 'Draft duplicated',
      description: 'A copy of the draft has been created.',
    })
  }
  return (
    <div className='min-h-screen flex w-full bg-gray-25'>
      <SidebarProvider>
        <AppSidebar userRole={userRole as 'admin' | 'slp' | 'supervisor'} userName={userName} />
        <SidebarInset>
          <Header userRole={userRole as 'admin' | 'slp' | 'supervisor'} userName={userName} />
          <main className='flex-1 p-4 md:p-6 lg:p-8'>
            {/* Breadcrumb Navigation */}
            <div className='mb-6'>
              <div className='flex items-center gap-4 mb-4'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleBack}
                  className='text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2'>
                  <ChevronLeft className='w-4 h-4 mr-1' />
                  Back
                </Button>

                <Breadcrumb></Breadcrumb>
              </div>

              <div className='space-y-1 mt-4'>
                <h1 className='text-2xl font-semibold text-gray-900'>Screening Drafts</h1>
                <p className='text-gray-600'>
                  Manage your incomplete screening forms and continue where you left off
                </p>
              </div>
            </div>

            {/* Drafts List */}
            <DraftsList
              drafts={drafts}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              currentUserId={currentUserId}
              userRole={userRole}
            />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
const Drafts = () => {
  return <DraftsContent />
}
export default Drafts
