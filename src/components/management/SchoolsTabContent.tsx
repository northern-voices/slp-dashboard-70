import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Plus, Search, Trash2 } from 'lucide-react'
import { useOrganization } from '@/contexts/OrganizationContext'

interface SchoolsTabContentProps {
  schoolSearch: string
  setSchoolSearch: (value: string) => void
  filteredSchools: any[]
  onAddSchool: () => void
  onEditSchool: (school: any) => void
  onViewSchoolDetails: (school: any) => void
  onDeleteSchool?: (schoolId: string) => void
}

const SchoolsTabContent = ({
  schoolSearch,
  setSchoolSearch,
  filteredSchools,
  onAddSchool,
  onEditSchool,
  onViewSchoolDetails,
  onDeleteSchool,
}: SchoolsTabContentProps) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [selectedSchoolForDeletion, setSelectedSchoolForDeletion] = useState<any>(null)
  const { userProfile } = useOrganization()

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin'

  const handleDeleteClick = (school: any) => {
    setSelectedSchoolForDeletion(school)
    setDeleteConfirmation('')
  }

  const handleDeleteConfirm = () => {
    if (selectedSchoolForDeletion && onDeleteSchool) {
      onDeleteSchool(selectedSchoolForDeletion.id)
      setSelectedSchoolForDeletion(null)
      setDeleteConfirmation('')
    }
  }

  const handleDeleteCancel = () => {
    setSelectedSchoolForDeletion(null)
    setDeleteConfirmation('')
  }

  const isDeleteConfirmationValid = deleteConfirmation === selectedSchoolForDeletion?.name

  return (
    <div className='space-y-6'>
      <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
        <h2 className='text-xl font-semibold'>School Management</h2>
        <Button onClick={onAddSchool}>
          <Plus className='w-4 h-4 mr-2' />
          Add School
        </Button>
      </div>

      <div className='relative'>
        <Search className='absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2' />
        <Input
          placeholder='Search schools...'
          value={schoolSearch}
          onChange={e => setSchoolSearch(e.target.value)}
          className='max-w-md pl-10'
        />
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {filteredSchools.map(school => (
          <Card key={school.id} className='transition-shadow hover:shadow-md'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-lg'>{school.name}</CardTitle>
                {school.status}
              </div>
              <CardDescription>
                {school.city}
                {school.state ? `, ${school.state}` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <p className='text-sm'>
                  <strong>Phone:</strong> {school.phone || '—'}
                </p>
                <p className='text-sm'>
                  <strong>Assigned SLP:</strong>{' '}
                  {school.primary_slp
                    ? `${school.primary_slp.first_name} ${school.primary_slp.last_name}`
                    : '—'}
                </p>
              </div>
              <div className='flex mt-4 space-x-2'>
                <Button variant='outline' size='sm' onClick={() => onEditSchool(school)}>
                  Edit
                </Button>
                <Button variant='outline' size='sm' onClick={() => onViewSchoolDetails(school)}>
                  View Details
                </Button>
                {isAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant='outline'
                        size='sm'
                        className='text-red-600 hover:text-red-700 hover:bg-red-50'
                        onClick={() => handleDeleteClick(school)}>
                        <Trash2 className='w-4 h-4 mr-2' />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete School</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete{' '}
                          {selectedSchoolForDeletion?.name} and remove all associated data,
                          including student records and SLP assignments.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className='py-4'>
                        <p className='mb-2 text-sm text-gray-700'>
                          To confirm deletion, please type the school name:{' '}
                          <span className='font-semibold'>{selectedSchoolForDeletion?.name}</span>
                        </p>
                        <Input
                          value={deleteConfirmation}
                          onChange={e => setDeleteConfirmation(e.target.value)}
                          placeholder='Type the school name'
                          className='w-full'
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteConfirm}
                          disabled={!isDeleteConfirmationValid}
                          className='bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed'>
                          Delete School
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default SchoolsTabContent
