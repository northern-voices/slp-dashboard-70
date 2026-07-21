import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, User, Phone, AtSign, MapPin, X } from 'lucide-react'
import { School } from '@/types/database'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useAvailableSLPs } from '@/hooks/school/useAvailableSLPs'
import {
  useSchoolSlpAssignments,
  useSlpAssignmentActions,
} from '@/hooks/school/useSchoolSlpAssignments'

interface SchoolDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  school: School | null
  onEdit: (school: School) => void
}

const SchoolDetailsModal = ({ isOpen, onClose, school, onEdit }: SchoolDetailsModalProps) => {
  const { userProfile, currentOrganization } = useOrganization()
  const userRole = userProfile?.role || 'slp'
  const canManageSlpAssignments = userRole === 'super_admin'

  const { data: assignedSlps = [] } = useSchoolSlpAssignments(school?.id)
  const { data: availableSLPs = [] } = useAvailableSLPs(currentOrganization?.id)
  const { assignSlpToSchool, unassignSlpFromSchool } = useSlpAssignmentActions(school?.id)

  if (!school) return null

  const unassignedSLPs = availableSLPs.filter(
    slp => !assignedSlps.some(assigned => assigned.id === slp.id)
  )

  const infoItems = [
    { icon: Building2, label: 'School Name', value: school.name },
    { icon: Phone, label: 'Phone', value: school.phone || '—' },
    { icon: MapPin, label: 'Address', value: school.address || '—' },
    {
      icon: MapPin,
      label: 'Location',
      value: school.city
        ? `${school.city}${school.state ? `, ${school.state}` : ''}${school.zip ? ` ${school.zip}` : ''}`
        : '—',
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Building2 className='w-5 h-5' />
            School Details
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          <div className='grid gap-4'>
            {infoItems.map((item, index) => (
              <div key={index} className='flex items-start gap-3'>
                <div className='p-2 bg-gray-100 rounded-md'>
                  <item.icon className='w-4 h-4 text-gray-600' />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-600'>{item.label}</p>
                  <p className='text-base'>{item.value}</p>
                </div>
              </div>
            ))}

            <div className='flex items-start gap-3'>
              <div className='p-2 bg-gray-100 rounded-md'>
                <User className='w-4 h-4 text-gray-600' />
              </div>
              <div className='flex-1 space-y-2'>
                <p className='text-sm font-medium text-gray-600'>Assigned SLPs</p>

                {assignedSlps.length === 0 && (
                  <p className='text-base text-gray-500'>No SLPs assigned</p>
                )}
                {assignedSlps.map(slp => (
                  <div key={slp.assignmentId} className='flex items-center justify-between gap-2'>
                    <span className='text-base'>{slp.name}</span>
                    {canManageSlpAssignments && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => unassignSlpFromSchool(slp.assignmentId)}>
                        <X className='w-4 h-4 text-gray-500' />
                      </Button>
                    )}
                  </div>
                ))}

                {canManageSlpAssignments && unassignedSLPs.length > 0 && (
                  <Select onValueChange={userId => assignSlpToSchool(userId)}>
                    <SelectTrigger className='h-9 mt-2'>
                      <SelectValue placeholder='Add an SLP...' />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedSLPs.map(slp => (
                        <SelectItem key={slp.id} value={slp.id}>
                          {slp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <div className='flex justify-end gap-3 pt-2'>
            <Button variant='outline' onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => onEdit(school)}>Edit School</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SchoolDetailsModal
