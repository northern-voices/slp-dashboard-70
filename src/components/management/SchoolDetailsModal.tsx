import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Building2, User, Phone, AtSign, MapPin } from 'lucide-react'

interface SchoolDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  school: any
  onEdit: (school: any) => void
}

const SchoolDetailsModal = ({ isOpen, onClose, school, onEdit }: SchoolDetailsModalProps) => {
  if (!school) return null

  const infoItems = [
    { icon: Building2, label: 'School Name', value: school.name },
    {
      icon: User,
      label: 'Assigned SLP',
      value: school.primary_slp
        ? `${school.primary_slp.first_name} ${school.primary_slp.last_name}`
        : '—',
    },
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
