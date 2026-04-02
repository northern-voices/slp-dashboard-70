import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ProgressCheckHeader from '@/components/students/progress-check/ProgressCheckHeader'
import ProgressCheckForm from '@/components/students/progress-check/ProgressCheckForm'
import { useToast } from '@/hooks/use-toast'

const MonthlyProgressCheck = () => {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async values => {
    setIsSubmitting(true)
    try {
      // TODO: Replace with actual API call
      console.log('Monthly progress check submitted:', values)
      toast({
        title: 'Progress Check Saved',
        description: 'The monthly progress check has been successfully recorded.',
      })
      navigate(`/students/${studentId}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save the progress check. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => navigate(`/students/${studentId}`)

  if (!studentId) {
    return <div>Student ID not found</div>
  }

  return (
    <div className='max-x-4xl mx-auto'>
      <ProgressCheckHeader studentId={studentId} />
      <ProgressCheckForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

export default MonthlyProgressCheck
