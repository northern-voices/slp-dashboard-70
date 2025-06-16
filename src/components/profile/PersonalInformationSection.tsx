import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { Camera, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useOrganization } from '@/contexts/OrganizationContext'

interface PersonalInfoFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  licenseNumber: string
}

const PersonalInformationSection = () => {
  const { toast } = useToast()
  const { userProfile } = useOrganization()
  const [isEditing, setIsEditing] = useState(false)

  console.log(userProfile, 'userProfile')

  const form = useForm<PersonalInfoFormData>({
    defaultValues: {
      firstName: userProfile?.first_name || '',
      lastName: userProfile?.last_name || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
      licenseNumber: userProfile?.license_number || '',
    },
  })

  // Update form values when userProfile changes
  useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile.first_name || '',
        lastName: userProfile.last_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        licenseNumber: userProfile.license_number || '',
      })
    }
  }, [userProfile, form])

  const onSubmit = (data: PersonalInfoFormData) => {
    console.log('Updating personal information:', data)
    toast({
      title: 'Profile Updated',
      description: 'Your personal information has been updated successfully.',
    })
    setIsEditing(false)
  }

  const initials = `${form.watch('firstName')[0] || ''}${form.watch('lastName')[0] || ''}`

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          Personal Information
          <Button
            variant={isEditing ? 'outline' : 'default'}
            size='sm'
            onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </CardTitle>
        <CardDescription>Manage your basic profile information and contact details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col md:flex-row gap-6'>
          {/* Profile Photo Section */}
          <div className='flex flex-col items-center space-y-4'>
            <Avatar className='h-24 w-24'>
              <AvatarImage src='' alt='Profile' />
              <AvatarFallback className='text-lg font-semibold bg-brand text-white'>
                {initials}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button variant='outline' size='sm'>
                <Camera className='w-4 h-4 mr-2' />
                Change Photo
              </Button>
            )}
          </div>

          {/* Form Section */}
          <div className='flex-1'>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='firstName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='lastName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input {...field} type='email' disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='licenseNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Number</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isEditing && (
                  <div className='flex justify-end'>
                    <Button type='submit'>
                      <Save className='w-4 h-4 mr-2' />
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PersonalInformationSection
