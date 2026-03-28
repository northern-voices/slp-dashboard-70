import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SchoolSupportHeader from '@/components/students/school-support/SchoolSupportHeader'
import SchoolSupportForm from '@/components/students/school-support/SchoolSupportForm'
import { useToast } from '@/hooks/use-toast'

const SchoolSupportFormPage = () => {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async values => {
    setIsSubmitting(true)
    try {
      // TODO: Replace with actual API call
      console.log('School support form submitted:', values)
      toast({
        title: 'School Support Form Saved',
        description: 'The support form has been successfully created.',
      })
      navigate(`/students/${studentId}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save the support form. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => navigate(`/students/${studentId}`)

  if (!studentId) return <div>Student ID not found</div>

  return (
    <div className='max-w-4xl mx-auto'>
      <SchoolSupportHeader studentId={studentId} />
      <SchoolSupportForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

export default SchoolSupportFormPage
