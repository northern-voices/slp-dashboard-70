import { useState } from 'react'
import { School } from '@/types/database'
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
import { Plus, Search, Trash2, MapPin, Phone, User } from 'lucide-react'
import { useOrganization } from '@/contexts/OrganizationContext'

interface SchoolsTabContentProps {
  schoolSearch: string
  setSchoolSearch: (value: string) => void
  filteredSchools: School[]
  onAddSchool: () => void
  onEditSchool: (school: School) => void
  onViewSchoolDetails: (school: School) => void
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
  const [selectedSchoolForDeletion, setSelectedSchoolForDeletion] = useState<School | null>(null)
  const { userProfile } = useOrganization()

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin'

  const handleDeleteClick = (school: School) => {
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
        {isAdmin && (
          <Button onClick={onAddSchool}>
            <Plus className='w-4 h-4 mr-2' />
            Add School
          </Button>
        )}
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
          <Card key={school.id} className='overflow-hidden transition-shadow hover:shadow-md'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base font-semibold leading-snug'>{school.name}</CardTitle>
              <CardDescription className='flex items-center gap-1.5'>
                <MapPin className='w-3 h-3 shrink-0' />
                {school.city}
                {school.state ? `, ${school.state}` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='pb-4 space-y-2 border-b border-gray-100'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Phone className='w-3.5 h-3.5 text-gray-400 shrink-0' />
                  <span>{school.phone || '—'}</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <User className='w-3.5 h-3.5 text-gray-400 shrink-0' />
                  <span>
                    {school.primary_slp
                      ? `${school.primary_slp.first_name} ${school.primary_slp.last_name}`
                      : 'No SLP assigned'}
                  </span>
                </div>
              </div>
              <div className='flex gap-2 pt-3'>
                {isAdmin && (
                  <Button variant='outline' size='sm' onClick={() => onEditSchool(school)}>
                    Edit
                  </Button>
                )}
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
